import { NextResponse } from "next/server";
import axios from "../../../../lib/api/axios";

// GET /api/departments/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const response = await axios.get(`/api-gateway/departments/${id}`);

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

// PUT /api/departments/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const response = await axios.put(`/api-gateway/departments/${id}`, body);

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.response?.data?.detail || "Có lỗi xảy ra khi cập nhật khoa",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE /api/departments/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const response = await axios.delete(`/api-gateway/departments/${id}`);

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.detail || "Có lỗi xảy ra khi xóa khoa" },
      { status: error.response?.status || 500 }
    );
  }
}
