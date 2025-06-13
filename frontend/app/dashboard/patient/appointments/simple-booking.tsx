import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Định nghĩa SPECIALTIES từ database
const SPECIALTIES = [
  { id: 1, name: "Khoa Nội" },
  { id: 2, name: "Khoa Ngoại" },
  { id: 3, name: "Khoa Sản" },
  { id: 4, name: "Khoa Nhi" },
  { id: 5, name: "Khoa Mắt" },
  { id: 6, name: "Khoa Tai Mũi Họng" },
  { id: 7, name: "Khoa Răng Hàm Mặt" },
  { id: 8, name: "Khoa Da liễu" },
  { id: 9, name: "Khoa Thần kinh" },
  { id: 10, name: "Khoa Tim mạch" },
  { id: 11, name: "Khoa Hô hấp" },
  { id: 12, name: "Khoa Tiêu hóa" },
  { id: 13, name: "Khoa Nội tiết" },
  { id: 14, name: "Khoa Xương khớp" },
  { id: 15, name: "Khoa Ung bướu" },
  { id: 16, name: "Khoa Truyền nhiễm" },
  { id: 17, name: "Khoa Tâm thần" },
  { id: 18, name: "Khoa Phục hồi chức năng" },
  { id: 19, name: "Khoa Y học cổ truyền" },
  { id: 20, name: "Khoa Dinh dưỡng" },
  { id: 21, name: "Khoa Khám bệnh" },
  { id: 22, name: "Khoa Cấp cứu" },
  { id: 23, name: "Khoa Hồi sức cấp cứu" },
  { id: 24, name: "Khoa Chẩn đoán hình ảnh" },
  { id: 25, name: "Khoa Xét nghiệm" },
  { id: 26, name: "Khoa Dược" },
  { id: 27, name: "Khoa Vật lý trị liệu" },
  { id: 28, name: "Khoa Thẩm mỹ" },
  { id: 29, name: "Khoa Khám sức khỏe" },
  { id: 30, name: "Khoa Khám bệnh từ xa" },
];

interface Doctor {
  id: number;
  full_name: string;
  specialty: number;
}

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const SimpleBooking: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch doctors
    axios
      .get("/api/doctors/")
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]));
    // Generate next 7 days
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    setDates(days);
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      setFilteredDoctors(
        doctors.filter((d) => d.specialty === selectedSpecialty)
      );
      setSelectedDoctor(null);
      setTimeSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedSpecialty, doctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoading(true);
      axios
        .get(`/api/doctors/${selectedDoctor}/timeslots/?date=${selectedDate}`)
        .then((res) =>
          setTimeSlots(res.data.filter((slot: TimeSlot) => !slot.is_booked))
        )
        .catch(() => setTimeSlots([]))
        .finally(() => setLoading(false));
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("/api/appointments/", {
        doctor: selectedDoctor,
        timeslot: selectedSlot,
        reason,
      });
      setSuccess("Đặt lịch thành công!");
      setReason("");
      setSelectedSlot(null);
      setSelectedDoctor(null);
      setSelectedSpecialty(null);
      setSelectedDate("");
      setTimeSlots([]);
      setTimeout(() => router.push("/dashboard/patient/appointments"), 1500);
    } catch (err: any) {
      setError("Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-xl mx-auto p-6 bg-white rounded shadow'>
      <h2 className='text-2xl font-bold mb-4'>Đặt lịch khám đơn giản</h2>
      <form
        onSubmit={handleBook}
        className='space-y-4'>
        <div>
          <label className='block mb-1 font-medium'>Chuyên khoa</label>
          <select
            className='w-full border rounded px-3 py-2'
            value={selectedSpecialty || ""}
            onChange={(e) =>
              setSelectedSpecialty(Number(e.target.value) || null)
            }
            required>
            <option value=''>Chọn chuyên khoa</option>
            {SPECIALTIES.map((s) => (
              <option
                key={s.id}
                value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block mb-1 font-medium'>Bác sĩ</label>
          <select
            className='w-full border rounded px-3 py-2'
            value={selectedDoctor || ""}
            onChange={(e) => setSelectedDoctor(Number(e.target.value) || null)}
            required
            disabled={!selectedSpecialty}>
            <option value=''>Chọn bác sĩ</option>
            {filteredDoctors.map((d) => (
              <option
                key={d.id}
                value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block mb-1 font-medium'>Ngày khám</label>
          <select
            className='w-full border rounded px-3 py-2'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            disabled={!selectedDoctor}>
            <option value=''>Chọn ngày</option>
            {dates.map((date) => (
              <option
                key={date}
                value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block mb-1 font-medium'>Khung giờ</label>
          <select
            className='w-full border rounded px-3 py-2'
            value={selectedSlot || ""}
            onChange={(e) => setSelectedSlot(Number(e.target.value) || null)}
            required
            disabled={!selectedDate || loading}>
            <option value=''>Chọn khung giờ</option>
            {timeSlots.map((slot) => (
              <option
                key={slot.id}
                value={slot.id}>
                {slot.start_time} - {slot.end_time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block mb-1 font-medium'>Lý do khám</label>
          <input
            className='w-full border rounded px-3 py-2'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder='Nhập lý do khám...'
          />
        </div>
        {error && <div className='text-red-500'>{error}</div>}
        {success && <div className='text-green-600'>{success}</div>}
        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50'
          disabled={loading}>
          {loading ? "Đang đặt lịch..." : "Đặt lịch"}
        </button>
      </form>
    </div>
  );
};

export default SimpleBooking;
