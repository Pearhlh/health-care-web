import { NextResponse } from "next/server";
import axios from "../../../lib/api/axios";

// GET /api/doctors
export async function GET(request) {
  try {
    const url = new URL(request.url);
    // Lấy tất cả các query parameters
    const department_id = url.searchParams.get("department_id");
    const user_id = url.searchParams.get("user_id");
    const no_doctor_profile = url.searchParams.get("no_doctor_profile");

    // Tạo object params
    const params = {};
    if (department_id) params.department_id = department_id;
    if (user_id) params.user_id = user_id;
    if (no_doctor_profile) params.no_doctor_profile = no_doctor_profile;

    const response = await axios.get("/api-gateway/doctors", { params });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail ||
          "Có lỗi xảy ra khi lấy dữ liệu bác sĩ",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST /api/doctors
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await axios.post("/api-gateway/doctors", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail || "Có lỗi xảy ra khi tạo hồ sơ bác sĩ",
      },
      { status: error.response?.status || 500 }
    );
  }
}
