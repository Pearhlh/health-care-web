from django.db import models
from django.utils import timezone
import uuid


class Department(models.Model):
    """Khoa trong bệnh viện"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=255, blank=True, null=True)  # URL hình ảnh
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    """Hồ sơ chi tiết của bác sĩ"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.IntegerField(unique=True)  # ID từ user service
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    specialty = models.CharField(max_length=100)
    qualifications = models.TextField()
    experience_years = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    avatar = models.CharField(max_length=255, blank=True, null=True)  # URL avatar
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Doctor {self.user_id}"
    
    class Meta:
        indexes = [
            models.Index(fields=['user_id']),
        ]


class DoctorAvailability(models.Model):
    """Lịch trống của bác sĩ"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)  # False nếu đã có lịch hẹn
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.doctor} - {self.date} {self.start_time}-{self.end_time}"

    class Meta:
        indexes = [
            models.Index(fields=['date', 'doctor']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='check_end_time_after_start_time'
            )
        ]


class TimeSlot(models.Model):
    """Khung giờ khám bệnh"""
    STATUS_CHOICES = [
        ('AVAILABLE', 'Còn trống'),
        ('BOOKED', 'Đã đặt'),
        ('CANCELLED', 'Đã hủy'),
        ('BLOCKED', 'Bị khóa')
    ]

    SOURCE_TYPE_CHOICES = [
        ('REGULAR', 'Từ lịch thường xuyên'),
        ('TEMPORARY', 'Từ lịch tạm thời'),
        ('MANUAL', 'Tạo thủ công')
    ]

    doctor_id = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    date = models.DateField(help_text="Ngày khám")
    start_time = models.TimeField(help_text="Giờ bắt đầu")
    end_time = models.TimeField(help_text="Giờ kết thúc")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE', help_text="Trạng thái khung giờ")
    is_active = models.BooleanField(default=True, help_text="Khung giờ có đang hoạt động hay không")
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES, default='REGULAR', help_text="Nguồn gốc của khung giờ")
    availability = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, related_name='time_slots', null=True, blank=True)

    # Thông tin địa điểm
    location = models.CharField(max_length=255, help_text="Địa điểm khám", blank=True, null=True)
    department = models.CharField(max_length=100, help_text="Khoa/Phòng", blank=True, null=True)
    room = models.CharField(max_length=50, help_text="Phòng khám", blank=True, null=True)

    # Các thuộc tính bổ sung
    duration = models.IntegerField(default=30, help_text="Thời lượng khám (phút)")
    max_patients = models.IntegerField(default=1, help_text="Số lượng bệnh nhân tối đa")
    current_patients = models.IntegerField(default=0, help_text="Số lượng bệnh nhân hiện tại")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.doctor_id} - {self.date} ({self.start_time} - {self.end_time}) - {self.get_status_display()}"

    class Meta:
        verbose_name = "Time Slot"
        verbose_name_plural = "Time Slots"
        unique_together = ['doctor_id', 'date', 'start_time', 'end_time']
        ordering = ['date', 'start_time']

    def has_capacity(self):
        """Kiểm tra xem khung giờ còn chỗ cho bệnh nhân hay không"""
        return self.current_patients < self.max_patients and self.status == 'AVAILABLE' and self.is_active

    def update_status(self):
        """Cập nhật trạng thái dựa trên số lượng bệnh nhân hiện tại"""
        # Đảm bảo current_patients không âm
        if self.current_patients < 0:
            self.current_patients = 0

        # Cập nhật trạng thái
        if self.current_patients >= self.max_patients:
            self.status = 'BOOKED'
        else:
            self.status = 'AVAILABLE'

        self.save(update_fields=['current_patients', 'status'])

    def add_patient(self):
        """Thêm một bệnh nhân vào khung giờ và cập nhật trạng thái"""
        from .exceptions import TimeSlotUnavailableException, TimeSlotCapacityExceededException
        from django.db import transaction
        import logging

        logger = logging.getLogger(__name__)

        # Sử dụng transaction và select_for_update để tránh race condition
        with transaction.atomic():
            # Khóa row này cho đến khi transaction hoàn thành
            time_slot = TimeSlot.objects.select_for_update().get(pk=self.id)

            # Kiểm tra lại sau khi đã khóa row
            if time_slot.current_patients >= time_slot.max_patients:
                time_slot.status = 'BOOKED'
                time_slot.save(update_fields=['status'])
                raise TimeSlotCapacityExceededException(f"Khung giờ {self.id} đã đạt số lượng bệnh nhân tối đa ({self.max_patients})")

            if time_slot.status != 'AVAILABLE' or not time_slot.is_active:
                logger.warning(f"Trying to add patient to unavailable time slot {self.id} with status {time_slot.status}")
                raise TimeSlotUnavailableException(f"Khung giờ {self.id} không khả dụng")

            # Cập nhật số lượng bệnh nhân
            time_slot.current_patients += 1

            # Cập nhật trạng thái
            if time_slot.current_patients >= time_slot.max_patients:
                time_slot.status = 'BOOKED'

            time_slot.save(update_fields=['current_patients', 'status'])

            # Cập nhật object hiện tại để phản ánh thay đổi
            self.current_patients = time_slot.current_patients
            self.status = time_slot.status

        return True

    def remove_patient(self):
        """Xóa một bệnh nhân khỏi khung giờ và cập nhật trạng thái"""
        from django.db import transaction
        import logging

        logger = logging.getLogger(__name__)

        # Sử dụng transaction và select_for_update để tránh race condition
        with transaction.atomic():
            time_slot = TimeSlot.objects.select_for_update().get(pk=self.id)

            if time_slot.current_patients <= 0:
                # Thay vì ném ngoại lệ, chỉ ghi log và đảm bảo khung giờ được đánh dấu là khả dụng
                logger.warning(f"Trying to remove patient from time slot {self.id} with current_patients={time_slot.current_patients}")
                time_slot.current_patients = 0
                time_slot.status = 'AVAILABLE'
                time_slot.save(update_fields=['current_patients', 'status'])

                # Cập nhật object hiện tại để phản ánh thay đổi
                self.current_patients = time_slot.current_patients
                self.status = time_slot.status

                return True

            # Giảm số lượng bệnh nhân
            time_slot.current_patients -= 1

            # Cập nhật trạng thái dựa trên số lượng bệnh nhân mới
            if time_slot.current_patients < time_slot.max_patients:
                time_slot.status = 'AVAILABLE'

            time_slot.save(update_fields=['current_patients', 'status'])

            # Cập nhật object hiện tại để phản ánh thay đổi
            self.current_patients = time_slot.current_patients
            self.status = time_slot.status

        return True

    def save(self, *args, **kwargs):
        """Ghi đè phương thức save để đảm bảo tính nhất quán giữa trạng thái và current_patients"""
        # Đảm bảo current_patients không âm
        if self.current_patients < 0:
            self.current_patients = 0

        # Đảm bảo trạng thái phản ánh đúng số lượng bệnh nhân
        if self.current_patients >= self.max_patients:
            self.status = 'BOOKED'
        elif self.status != 'BLOCKED' and self.status != 'CANCELLED':
            self.status = 'AVAILABLE'

        super().save(*args, **kwargs)


class AppointmentReason(models.Model):
    """Phân loại lý do khám"""
    name = models.CharField(max_length=100, help_text="Tên lý do khám")
    description = models.TextField(blank=True, null=True, help_text="Mô tả chi tiết")
    department = models.CharField(max_length=100, blank=True, null=True, help_text="Khoa/Phòng liên quan")
    priority = models.IntegerField(default=0, help_text="Mức độ ưu tiên (cao hơn = ưu tiên hơn)")
    estimated_duration = models.IntegerField(default=30, help_text="Thời gian ước tính (phút)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Appointment Reason"
        verbose_name_plural = "Appointment Reasons"
        ordering = ['-priority', 'name']


class AppointmentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Chờ xác nhận'
    CONFIRMED = 'CONFIRMED', 'Đã xác nhận'
    COMPLETED = 'COMPLETED', 'Hoàn thành'
    CANCELLED = 'CANCELLED', 'Đã hủy'
    RESCHEDULED = 'RESCHEDULED', 'Đã đổi lịch'
    NO_SHOW = 'NO_SHOW', 'Không đến'


class Appointment(models.Model):
    """Lịch hẹn của bệnh nhân với bác sĩ"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.IntegerField()  # ID từ user service
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    availability = models.OneToOneField(DoctorAvailability, on_delete=models.SET_NULL, null=True, related_name='appointment')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=AppointmentStatus.choices, default=AppointmentStatus.PENDING)
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment for patient {self.patient_id} with doctor {self.doctor}"

    class Meta:
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['appointment_date']),
            models.Index(fields=['doctor', 'appointment_date']),
        ]


class AppointmentReminder(models.Model):
    """Nhắc nhở lịch hẹn khám bệnh"""
    REMINDER_TYPE_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Chờ gửi'),
        ('SENT', 'Đã gửi'),
        ('FAILED', 'Gửi thất bại'),
    ]

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPE_CHOICES)
    scheduled_time = models.DateTimeField(help_text="Thời gian dự kiến gửi nhắc nhở")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    message = models.TextField(help_text="Nội dung tin nhắn nhắc nhở")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_reminder_type_display()} reminder cho appointment {self.appointment.id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Appointment Reminder"
        verbose_name_plural = "Appointment Reminders"
        ordering = ['scheduled_time']


class PatientVisit(models.Model):
    """Thông tin chi tiết về lần khám bệnh"""
    VISIT_STATUS_CHOICES = [
        ('WAITING', 'Đang chờ'),
        ('WITH_NURSE', 'Đang với y tá'),
        ('WITH_DOCTOR', 'Đang khám với bác sĩ'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('CANCELLED', 'Đã hủy')
    ]

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='visit')
    status = models.CharField(max_length=20, choices=VISIT_STATUS_CHOICES, default='WAITING')

    # Thông tin check-in
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.IntegerField(help_text="ID người check-in (nhân viên)", null=True, blank=True)

    # Thông tin khám bệnh
    nurse_id = models.IntegerField(null=True, blank=True, help_text="ID y tá phụ trách")
    vitals_recorded = models.BooleanField(default=False, help_text="Dấu hiệu sinh tồn đã được ghi nhận")
    vitals_recorded_at = models.DateTimeField(null=True, blank=True)

    # Thời gian thực tế
    doctor_start_time = models.DateTimeField(null=True, blank=True, help_text="Thời gian bắt đầu khám với bác sĩ")
    doctor_end_time = models.DateTimeField(null=True, blank=True, help_text="Thời gian kết thúc khám với bác sĩ")
    waiting_time = models.IntegerField(null=True, blank=True, help_text="Thời gian chờ (phút)")

    # Thông tin bổ sung
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visit for appointment {self.appointment.id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Patient Visit"
        verbose_name_plural = "Patient Visits"