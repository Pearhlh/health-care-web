import { NextResponse } from "next/server";
import axios from "../../../../../lib/api/axios";

// GET /api/doctors/[id]/availabilities
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const url = new URL(request.url);

    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");

    const queryParams = {};
    if (start_date) queryParams.start_date = start_date;
    if (end_date) queryParams.end_date = end_date;

    const response = await axios.get(
      `/api-gateway/doctors/${id}/availabilities`,
      { params: queryParams }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail ||
          "Có lỗi xảy ra khi lấy lịch trống của bác sĩ",
      },
      { status: error.response?.status || 500 }
    );
  }
}
