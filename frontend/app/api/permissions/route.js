import { NextResponse } from "next/server";

// Mock API route for permissions management
const mockPermissions = [
  { id: 1, name: "Quản lý người dùng", codename: "user_manage" },
  { id: 2, name: "Quản lý vai trò", codename: "role_manage" },
  { id: 3, name: "Xem thống kê", codename: "stats_view" },
  { id: 4, name: "Quản lý bệnh nhân", codename: "patient_manage" },
  { id: 5, name: "Kê đơn thuốc", codename: "prescription_manage" },
  { id: 6, name: "Xem hồ sơ bệnh án", codename: "medical_record_view" },
  { id: 7, name: "Cập nhật thông tin bệnh nhân", codename: "patient_update" },
  { id: 8, name: "Xem hồ sơ bệnh án", codename: "medical_record_view" },
  { id: 9, name: "Xem thông tin cá nhân", codename: "self_view" },
  { id: 10, name: "Đặt lịch khám", codename: "appointment_create" },
  { id: 11, name: "Quản lý thuốc", codename: "pharmacy_manage" },
  { id: 12, name: "Cấp phát thuốc", codename: "pharmacy_dispense" },
  { id: 13, name: "Quản lý xét nghiệm", codename: "laboratory_manage" },
  { id: 14, name: "Nhập kết quả xét nghiệm", codename: "laboratory_result" },
  { id: 15, name: "Quản lý thanh toán", codename: "billing_manage" },
  { id: 16, name: "Quản lý bảo hiểm", codename: "insurance_manage" },
  { id: 17, name: "Quản lý thông báo", codename: "notification_manage" },
  { id: 18, name: "Cấu hình hệ thống", codename: "system_config" },
];

// Get all permissions
export async function GET() {
  return NextResponse.json(mockPermissions);
}
