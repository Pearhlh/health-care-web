import { NextResponse } from "next/server";
import axios from "../../../lib/api/axios";

// GET /api/departments
export async function GET(request) {
  try {
    const response = await axios.get("/api-gateway/departments");
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail || "Có lỗi xảy ra khi lấy dữ liệu khoa",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST /api/departments
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await axios.post("/api-gateway/departments", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.detail || "Có lỗi xảy ra khi tạo khoa" },
      { status: error.response?.status || 500 }
    );
  }
}
