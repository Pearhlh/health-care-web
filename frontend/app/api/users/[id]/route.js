import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mock API route for individual user management
const mockUsers = [
  {
    id: 1,
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "ADMIN",
    is_active: true,
    phone: "0901234567",
    address: "123 Đường Admin, Quận 1, TP.HCM",
    profile: {
      department: "IT",
      position: "System Administrator",
    },
  },
  {
    id: 2,
    first_name: "Nguyễn",
    last_name: "Văn A",
    email: "doctor1@example.com",
    role: "DOCTOR",
    is_active: true,
    phone: "0912345678",
    address: "456 Đường Bác Sĩ, Quận 2, TP.HCM",
    profile: {
      specialization: "Nội khoa",
      qualification: "Tiến sĩ Y khoa",
      experience: 10,
      bio: "Bác sĩ chuyên khoa nội với hơn 10 năm kinh nghiệm",
    },
  },
  {
    id: 3,
    first_name: "Trần",
    last_name: "Thị B",
    email: "nurse@example.com",
    role: "NURSE",
    is_active: true,
    phone: "0923456789",
    address: "789 Đường Y Tá, Quận 3, TP.HCM",
    profile: {
      department: "Khoa Nhi",
      qualification: "Cử nhân điều dưỡng",
      experience: 5,
    },
  },
  {
    id: 4,
    first_name: "Lê",
    last_name: "Văn C",
    email: "patient@example.com",
    role: "PATIENT",
    is_active: false,
    phone: "0934567890",
    address: "101 Đường Bệnh Nhân, Quận 4, TP.HCM",
    profile: {
      dob: "1990-05-15",
      gender: "male",
      blood_type: "O+",
      allergies: "Không có",
      emergency_contact: "Lê Thị D - 0987654321",
    },
  },
];

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    const userId = parseInt(params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin người dùng" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  try {
    const userId = parseInt(params.id);
    const data = await request.json();

    // Kiểm tra xem người dùng có tồn tại không
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
        // Cập nhật profile nếu có
        profile: data.profile
          ? {
              upsert: {
                create: {
                  phone: data.phone || "",
                  address: data.address || "",
                  ...data.profile,
                },
                update: {
                  phone: data.phone || "",
                  address: data.address || "",
                  ...data.profile,
                },
              },
            }
          : undefined,
      },
      include: { profile: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật thông tin người dùng" },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const userId = parseInt(params.id);

    // Kiểm tra xem người dùng có tồn tại không
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Xóa người dùng (Prisma sẽ tự động xóa profile do có cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Không thể xóa người dùng" },
      { status: 500 }
    );
  }
}
