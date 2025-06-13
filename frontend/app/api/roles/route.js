import { NextResponse } from "next/server";

// Mock API route for roles management
const mockRoles = [
  {
    id: 1,
    name: "ADMIN",
    description: "Quản trị viên hệ thống",
    permissions: [
      { id: 1, name: "Quản lý người dùng", codename: "user_manage" },
      { id: 2, name: "Quản lý vai trò", codename: "role_manage" },
      { id: 3, name: "Xem thống kê", codename: "stats_view" },
    ],
  },
  {
    id: 2,
    name: "DOCTOR",
    description: "Bác sĩ",
    permissions: [
      { id: 4, name: "Quản lý bệnh nhân", codename: "patient_manage" },
      { id: 5, name: "Kê đơn thuốc", codename: "prescription_manage" },
      { id: 6, name: "Xem hồ sơ bệnh án", codename: "medical_record_view" },
    ],
  },
  {
    id: 3,
    name: "NURSE",
    description: "Y tá",
    permissions: [
      {
        id: 7,
        name: "Cập nhật thông tin bệnh nhân",
        codename: "patient_update",
      },
      { id: 8, name: "Xem hồ sơ bệnh án", codename: "medical_record_view" },
    ],
  },
  {
    id: 4,
    name: "PATIENT",
    description: "Bệnh nhân",
    permissions: [
      { id: 9, name: "Xem thông tin cá nhân", codename: "self_view" },
      { id: 10, name: "Đặt lịch khám", codename: "appointment_create" },
    ],
  },
  {
    id: 5,
    name: "PHARMACIST",
    description: "Dược sĩ",
    permissions: [
      { id: 11, name: "Quản lý thuốc", codename: "medication_manage" },
      { id: 12, name: "Cấp phát thuốc", codename: "dispense_manage" },
    ],
  },
  {
    id: 6,
    name: "LAB_TECH",
    description: "Kỹ thuật viên xét nghiệm",
    permissions: [
      { id: 13, name: "Quản lý xét nghiệm", codename: "lab_test_manage" },
      {
        id: 14,
        name: "Nhập kết quả xét nghiệm",
        codename: "lab_result_create",
      },
    ],
  },
];

// GET /api/roles
export async function GET() {
  return NextResponse.json(mockRoles);
}

// POST /api/roles
export async function POST(request) {
  try {
    const data = await request.json();

    const newRole = {
      id: mockRoles.length + 1,
      name: data.name,
      description: data.description,
      permissions: data.permissions
        ? data.permissions
            .map((id) => {
              // Find the permission by ID from all existing permissions
              const allPermissions = mockRoles.flatMap(
                (role) => role.permissions
              );
              return allPermissions.find((p) => p.id === id);
            })
            .filter(Boolean)
        : [],
    };

    // In a real API, this would be saved to a database

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
