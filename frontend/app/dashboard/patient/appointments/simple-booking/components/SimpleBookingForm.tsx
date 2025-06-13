import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// SPECIALTIES dạng group
const SPECIALTIES = {
  NOI: [
    { value: "NOI_TIM_MACH", label: "Nội Tim Mạch" },
    { value: "NOI_TIEU_HOA", label: "Nội Tiêu Hóa" },
    { value: "NOI_HO_HAP", label: "Nội Hô Hấp" },
    { value: "NOI_THAN", label: "Nội Thận" },
    { value: "NOI_TIET", label: "Nội Tiết" },
    { value: "NOI_THAN_KINH", label: "Nội Thần Kinh" },
    { value: "NOI_DA_LIEU", label: "Nội Da Liễu" },
    { value: "NOI_TONG_QUAT", label: "Nội Tổng Quát" },
  ],
  NGOAI: [
    { value: "NGOAI_CHINH_HINH", label: "Ngoại Chỉnh Hình" },
    { value: "NGOAI_TIET_NIEU", label: "Ngoại Tiết Niệu" },
    { value: "NGOAI_THAN_KINH", label: "Ngoại Thần Kinh" },
    { value: "NGOAI_LONG_NGUC", label: "Ngoại Lồng Ngực" },
    { value: "NGOAI_TIEU_HOA", label: "Ngoại Tiêu Hóa" },
    { value: "NGOAI_TONG_QUAT", label: "Ngoại Tổng Quát" },
  ],
  SAN: [
    { value: "SAN_KHOA", label: "Sản Khoa" },
    { value: "PHU_KHOA", label: "Phụ Khoa" },
    { value: "VO_SINH", label: "Vô Sinh" },
  ],
  NHI: [
    { value: "NHI_TONG_QUAT", label: "Nhi Tổng Quát" },
    { value: "NHI_TIM_MACH", label: "Nhi Tim Mạch" },
    { value: "NHI_THAN_KINH", label: "Nhi Thần Kinh" },
    { value: "NHI_SO_SINH", label: "Nhi Sơ Sinh" },
  ],
  KHAC: [
    { value: "MAT", label: "Mắt" },
    { value: "TAI_MUI_HONG", label: "Tai Mũi Họng" },
    { value: "RANG_HAM_MAT", label: "Răng Hàm Mặt" },
    { value: "TAM_THAN", label: "Tâm Thần" },
    { value: "UNG_BUOU", label: "Ung Bướu" },
    { value: "DA_KHOA", label: "Đa Khoa" },
    { value: "KHAC", label: "Khác" },
  ],
};

const SPECIALTY_GROUP_LABELS: Record<string, string> = {
  NOI: "Nội",
  NGOAI: "Ngoại",
  SAN: "Sản",
  NHI: "Nhi",
  KHAC: "Khác",
};

// Chuyển đổi mã ngày thành tên ngày tiếng Việt
const dayCodeToVietnamese = (dayCode: string) => {
  switch (dayCode) {
    case "MON":
      return "Thứ Hai";
    case "TUE":
      return "Thứ Ba";
    case "WED":
      return "Thứ Tư";
    case "THU":
      return "Thứ Năm";
    case "FRI":
      return "Thứ Sáu";
    case "SAT":
      return "Thứ Bảy";
    case "SUN":
      return "Chủ Nhật";
    default:
      return dayCode;
  }
};

interface Doctor {
  id: number;
  user_id: number;
  full_name: string;
  specialty: string;
  department: string;
  avatar?: string;
  available_dates?: string[];
  working_hours?: string;
  working_days?: string;
}

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  date?: string;
  doctor_id?: number;
  location?: string;
  department?: string;
}

interface Availability {
  id: number;
  doctor: number;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function SimpleBookingForm() {
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<Doctor | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const router = useRouter();

  // Fetch doctors theo chuyên khoa
  useEffect(() => {
    if (selectedSpecialty) {
      setFilteredDoctors([]);
      setSelectedDoctor(null);
      setSelectedDoctorInfo(null);
      setAvailableDates([]);
      setTimeSlots([]);
      setSelectedSlot(null);
      setLoading(true);

      // Gọi trực tiếp đến API Gateway thay vì qua Next.js API route
      axios
        .get(
          `http://localhost:4000/api/doctors?specialization=${selectedSpecialty}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(async (response) => {
          // Lấy danh sách bác sĩ từ API
          const doctorProfiles = response.data;

          // Tạo mảng để lưu thông tin bác sĩ đầy đủ
          const doctorsWithUserInfo = await Promise.all(
            doctorProfiles.map(async (profile: any) => {
              try {
                // Lấy thông tin user của bác sĩ
                const userResponse = await axios.get(
                  `http://localhost:4000/api/users/${profile.user}/`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );

                const userData = userResponse.data;

                // Kết hợp thông tin profile và user
                return {
                  id: profile.id,
                  user_id: profile.user,
                  full_name: `${userData.first_name} ${userData.last_name}`,
                  specialty: profile.specialization,
                  department: profile.department,
                  avatar: userData.avatar || profile.profile_picture,
                  working_days: profile.working_days,
                  working_hours: profile.working_hours,
                };
              } catch (error) {
                console.error(
                  `Error fetching user info for doctor ${profile.id}:`,
                  error
                );
                // Fallback nếu không lấy được thông tin user
                return {
                  id: profile.id,
                  user_id: profile.user,
                  full_name: `Bác sĩ #${profile.id}`,
                  specialty: profile.specialization,
                  department: profile.department,
                  avatar: profile.profile_picture,
                  working_days: profile.working_days,
                  working_hours: profile.working_hours,
                };
              }
            })
          );

          setFilteredDoctors(doctorsWithUserInfo);
        })
        .catch((error) => {
          console.error("Error fetching doctors:", error);
          setFilteredDoctors([]);
        })
        .finally(() => setLoading(false));
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty]);

  // Fetch available dates khi chọn bác sĩ
  useEffect(() => {
    if (selectedDoctor) {
      setLoadingDates(true);
      setAvailableDates([]);
      setSelectedDate("");
      setTimeSlots([]);
      setSelectedSlot(null);

      // Tìm thông tin bác sĩ đã chọn
      const doctorInfo =
        filteredDoctors.find((d) => d.id === selectedDoctor) || null;
      setSelectedDoctorInfo(doctorInfo);

      // Gọi API để lấy lịch làm việc của bác sĩ
      // Sử dụng user_id thay vì id của doctor profile
      const doctorUserId = doctorInfo?.user_id;

      if (!doctorUserId) {
        console.error("Doctor user ID not found");
        setLoadingDates(false);
        return;
      }

      // Lấy ngày làm việc từ working_days
      if (doctorInfo && doctorInfo.working_days) {
        const workingDayCodes = doctorInfo.working_days.split(",");

        // Tạo danh sách ngày trong 30 ngày tới
        const today = new Date();
        const next30Days: Date[] = [];

        // Map các mã ngày từ MON, TUE, ... sang số 0-6 (0 = Monday)
        const dayCodeToNumber: Record<string, number> = {
          MON: 0,
          TUE: 1,
          WED: 2,
          THU: 3,
          FRI: 4,
          SAT: 5,
          SUN: 6,
        };

        // Chuyển đổi mã ngày thành số
        const workingDayNumbers = workingDayCodes.map(
          (code) => dayCodeToNumber[code]
        );

        for (let i = 0; i < 30; i++) {
          const date = addDays(today, i);
          // Lưu ý: getDay() trả về 0 là Sunday, 1 là Monday...
          // Chuyển đổi sang hệ thống 0 là Monday
          let dayOfWeek = date.getDay();
          dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chuyển 0 (Sunday) thành 6, và các ngày khác giảm 1

          // Kiểm tra xem ngày này có phải là ngày làm việc không
          if (workingDayNumbers.includes(dayOfWeek)) {
            next30Days.push(date);
          }
        }

        setAvailableDates(next30Days);
        setLoadingDates(false);
      } else {
        setLoadingDates(false);
      }
    }
  }, [selectedDoctor, filteredDoctors]);

  // Fetch time slots khi chọn ngày
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedDoctor && selectedDate) {
        setLoading(true);
        try {
          // Tìm thông tin bác sĩ đã chọn
          const doctorInfo =
            filteredDoctors.find((d) => d.id === selectedDoctor) || null;

          if (!doctorInfo || !doctorInfo.working_hours) {
            console.log("Không có thông tin giờ làm việc cho bác sĩ này");
            setTimeSlots([]);
            setLoading(false);
            return;
          }

          // Lấy giờ làm việc từ thông tin bác sĩ
          const workingHours = doctorInfo.working_hours;
          const [startTime, endTime] = workingHours.split("-");

          // Giả lập time slots với khoảng thời gian 30 phút
          const mockTimeSlots = [];
          const startHour = parseInt(startTime.split(":")[0]);
          const startMinute = parseInt(startTime.split(":")[1] || "0");
          const endHour = parseInt(endTime.split(":")[0]);
          const endMinute = parseInt(endTime.split(":")[1] || "0");

          let currentHour = startHour;
          let currentMinute = startMinute;

          let slotId = 1;

          while (
            currentHour < endHour ||
            (currentHour === endHour && currentMinute < endMinute)
          ) {
            const nextMinute = (currentMinute + 30) % 60;
            const nextHour =
              nextMinute < currentMinute ? currentHour + 1 : currentHour;

            if (
              nextHour > endHour ||
              (nextHour === endHour && nextMinute > endMinute)
            ) {
              break;
            }

            const slot = {
              id: slotId++,
              start_time: `${currentHour
                .toString()
                .padStart(2, "0")}:${currentMinute
                .toString()
                .padStart(2, "0")}:00`,
              end_time: `${nextHour.toString().padStart(2, "0")}:${nextMinute
                .toString()
                .padStart(2, "0")}:00`,
              is_booked: false,
              date: selectedDate,
              doctor_id: selectedDoctor,
              location: doctorInfo.department,
              department: doctorInfo.department,
            };

            mockTimeSlots.push(slot);

            currentHour = nextHour;
            currentMinute = nextMinute;
          }

          setTimeSlots(mockTimeSlots);
        } catch (error) {
          console.error("Error creating time slots:", error);
          setTimeSlots([]);
        } finally {
          setLoading(false);
        }
      } else {
        setTimeSlots([]);
        setSelectedSlot(null);
      }
    };

    fetchTimeSlots();
  }, [selectedDoctor, selectedDate, filteredDoctors]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi trực tiếp đến API Gateway thay vì qua Next.js API route
      await axios.post(
        "http://localhost:4000/api/appointments/",
        {
          doctor: selectedDoctor,
          time_slot_id: selectedSlot,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Đặt lịch thành công!");
      setReason("");
      setSelectedSlot(null);
      setSelectedDoctor(null);
      setSelectedSpecialty(null);
      setSelectedDate("");
      setTimeSlots([]);
      setTimeout(() => {
        router.push("/dashboard/patient/appointments");
      }, 1500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-6 bg-white rounded shadow'>
      <form
        onSubmit={handleBook}
        className='space-y-4'>
        <div className='space-y-2'>
          <Label>Chuyên khoa</Label>
          <Select
            value={selectedSpecialty || ""}
            onValueChange={(value) => setSelectedSpecialty(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder='Chọn chuyên khoa' />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SPECIALTIES).map(([group, specialties]) => (
                <SelectGroup key={group}>
                  <SelectLabel>{SPECIALTY_GROUP_LABELS[group]}</SelectLabel>
                  {specialties.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Bác sĩ</Label>
          <Select
            value={selectedDoctor?.toString() || ""}
            onValueChange={(value) => setSelectedDoctor(Number(value) || null)}
            disabled={!selectedSpecialty || loading}>
            <SelectTrigger>
              <SelectValue placeholder='Chọn bác sĩ' />
            </SelectTrigger>
            <SelectContent>
              {filteredDoctors.length === 0 && (
                <div className='px-4 py-2 text-gray-500'>
                  Không có bác sĩ phù hợp
                </div>
              )}
              {filteredDoctors.map((d) => (
                <SelectItem
                  key={d.id}
                  value={d.id.toString()}>
                  {d.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDoctorInfo && (
          <div className='p-3 bg-gray-50 rounded-md'>
            <p className='font-medium'>{selectedDoctorInfo.full_name}</p>
            <p className='text-sm text-gray-600'>
              Chuyên khoa: {selectedDoctorInfo.specialty}
            </p>
            {selectedDoctorInfo.working_days && (
              <p className='text-sm text-gray-600'>
                Ngày làm việc:{" "}
                {selectedDoctorInfo.working_days
                  .split(",")
                  .map(dayCodeToVietnamese)
                  .join(", ")}
              </p>
            )}
            {selectedDoctorInfo.working_hours && (
              <p className='text-sm text-gray-600'>
                Giờ làm việc: {selectedDoctorInfo.working_hours}
              </p>
            )}
          </div>
        )}

        {selectedDoctor && (
          <div className='space-y-2'>
            <Label>Ngày khám</Label>
            {loadingDates ? (
              <div className='text-center py-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto'></div>
                <p className='text-sm text-gray-500 mt-2'>
                  Đang tải ngày khám...
                </p>
              </div>
            ) : availableDates.length > 0 ? (
              <div className='space-y-2'>
                <Calendar
                  mode='single'
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onSelect={(date) =>
                    date && setSelectedDate(date.toISOString().split("T")[0])
                  }
                  disabled={(date) => {
                    // Disable ngày trong quá khứ và ngày không có trong availableDates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      date < today ||
                      !availableDates.some((d) => isSameDay(d, date))
                    );
                  }}
                  className='rounded-md border'
                />
                <div className='flex flex-wrap gap-1'>
                  {availableDates.slice(0, 10).map((date, index) => (
                    <Badge
                      key={index}
                      variant={
                        selectedDate === date.toISOString().split("T")[0]
                          ? "default"
                          : "outline"
                      }
                      className='cursor-pointer'
                      onClick={() =>
                        setSelectedDate(date.toISOString().split("T")[0])
                      }>
                      {format(date, "dd/MM")}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                Không có ngày khám phù hợp trong 30 ngày tới
              </p>
            )}
          </div>
        )}

        {selectedDate && (
          <div className='space-y-2'>
            <Label>Khung giờ</Label>
            <Select
              value={selectedSlot?.toString() || ""}
              onValueChange={(value) => setSelectedSlot(Number(value) || null)}
              disabled={!selectedDate || loading}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn khung giờ' />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className='px-4 py-2 text-gray-500'>
                    Đang tải khung giờ...
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className='px-4 py-2 text-gray-500'>
                    Không có khung giờ trống
                  </div>
                ) : (
                  timeSlots.map((slot) => (
                    <SelectItem
                      key={slot.id}
                      value={slot.id.toString()}>
                      {slot.start_time.substring(0, 5)} -{" "}
                      {slot.end_time.substring(0, 5)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className='space-y-2'>
          <Label>Lý do khám</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Nhập lý do khám...'
            rows={3}
          />
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={
            loading || !selectedDoctor || !selectedDate || !selectedSlot
          }>
          {loading ? "Đang đặt lịch..." : "Đặt lịch"}
        </Button>
      </form>
    </div>
  );
}
