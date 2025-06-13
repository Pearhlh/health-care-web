import { NextResponse } from "next/server";
import axios from "../../../lib/api/axios";

// GET /api/doctor-availabilities
export async function GET(request) {
  try {
    const url = new URL(request.url);
    // Lấy tất cả các query parameters
    const doctor_id = url.searchParams.get("doctor_id");
    const date = url.searchParams.get("date");
    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");

    // Tạo object params
    const params = {};
    if (doctor_id) params.doctor_id = doctor_id;
    if (date) params.date = date;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const response = await axios.get("/api-gateway/doctor-availabilities", {
      params,
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail ||
          "Có lỗi xảy ra khi lấy dữ liệu lịch trống",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST /api/doctor-availabilities
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await axios.post(
      "/api-gateway/doctor-availabilities",
      body
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail || "Có lỗi xảy ra khi tạo lịch trống",
      },
      { status: error.response?.status || 500 }
    );
  }
}
