// app/api/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mock API route for users management
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

// Get all users
export async function GET() {
  try {
    // Truy vấn tất cả người dùng từ database
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users from database:", error);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu người dùng từ database" },
      { status: 500 }
    );
  }
}

// Create a new user
export async function POST(request) {
  try {
    const data = await request.json();

    // Tạo người dùng mới trong database
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password, // Lưu ý: Trong thực tế, mật khẩu cần được hash
        role: data.role,
        is_active: data.is_active,
        profile: {
          create: {
            phone: data.phone || "",
            address: data.address || "",
            // Các trường profile khác tùy thuộc vào role
            ...(data.profile || {}),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Không thể tạo người dùng mới" },
      { status: 400 }
    );
  }
}
