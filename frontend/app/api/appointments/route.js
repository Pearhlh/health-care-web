import { NextResponse } from "next/server";
import axios from "../../../lib/api/axios";

// GET /api/appointments
export async function GET(request) {
  try {
    const url = new URL(request.url);
    // Lấy tất cả các query parameters
    const patient_id = url.searchParams.get("patient_id");
    const doctor_id = url.searchParams.get("doctor_id");
    const status = url.searchParams.get("status");
    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");

    // Tạo object params
    const params = {};
    if (patient_id) params.patient_id = patient_id;
    if (doctor_id) params.doctor_id = doctor_id;
    if (status) params.status = status;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const response = await axios.get("/api-gateway/appointments", { params });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail ||
          "Có lỗi xảy ra khi lấy dữ liệu lịch hẹn",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST /api/appointments
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await axios.post("/api-gateway/appointments", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: error.response?.data?.detail || "Có lỗi xảy ra khi đặt lịch hẹn",
      },
      { status: error.response?.status || 500 }
    );
  }
}
