// API route for user profile management
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mock users data (shared with other user routes)
const mockUsers = [
  {
    id: 1,
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "ADMIN",
    is_active: true,
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
    profile: {
      dob: "1990-05-15",
      gender: "male",
      blood_type: "O+",
      allergies: "Không có",
      emergency_contact: "Lê Thị D - 0987654321",
    },
  },
];

// Get user profile
export async function GET(request, { params }) {
  try {
    const userId = parseInt(params.id);

    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Không thể tải thông tin profile" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request, { params }) {
  try {
    const userId = parseInt(params.id);
    const data = await request.json();

    // Kiểm tra xem người dùng có tồn tại không
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedProfile;

    // Kiểm tra xem profile đã tồn tại chưa
    if (user.profile) {
      // Nếu đã có profile thì chỉ cập nhật
      updatedProfile = await prisma.profile.update({
        where: { user_id: userId },
        data: data.profile,
      });
    } else {
      // Nếu chưa có profile thì tạo mới
      updatedProfile = await prisma.profile.create({
        data: {
          user_id: userId,
          ...data.profile,
        },
      });
    }

    // Lấy thông tin người dùng đã cập nhật
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật profile" },
      { status: 400 }
    );
  }
}
