const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ nếu có
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // Tạo người dùng Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      password: "admin123", // Lưu ý: Trong thực tế, mật khẩu cần được hash
      role: "ADMIN",
      is_active: true,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          department: "IT",
          position: "System Administrator",
          phone: "0901234567",
          address: "123 Đường Admin, Quận 1, TP.HCM",
        },
      },
    },
  });
  console.log("Created admin:", admin.email);

  // Tạo người dùng Doctor
  const doctor = await prisma.user.create({
    data: {
      email: "doctor1@example.com",
      first_name: "Nguyễn",
      last_name: "Văn A",
      password: "doctor123",
      role: "DOCTOR",
      is_active: true,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          specialization: "Nội khoa",
          qualification: "Tiến sĩ Y khoa",
          experience: 10,
          bio: "Bác sĩ chuyên khoa nội với hơn 10 năm kinh nghiệm",
          phone: "0912345678",
          address: "456 Đường Bác Sĩ, Quận 2, TP.HCM",
        },
      },
    },
  });
  console.log("Created doctor:", doctor.email);

  // Tạo người dùng Nurse
  const nurse = await prisma.user.create({
    data: {
      email: "nurse@example.com",
      first_name: "Trần",
      last_name: "Thị B",
      password: "nurse123",
      role: "NURSE",
      is_active: true,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          department: "Khoa Nhi",
          qualification: "Cử nhân điều dưỡng",
          experience: 5,
          phone: "0923456789",
          address: "789 Đường Y Tá, Quận 3, TP.HCM",
        },
      },
    },
  });
  console.log("Created nurse:", nurse.email);

  // Tạo người dùng Patient
  const patient = await prisma.user.create({
    data: {
      email: "patient@example.com",
      first_name: "Lê",
      last_name: "Văn C",
      password: "patient123",
      role: "PATIENT",
      is_active: false,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          dob: "1990-05-15",
          gender: "male",
          blood_type: "O+",
          allergies: "Không có",
          emergency_contact: "Lê Thị D - 0987654321",
          phone: "0934567890",
          address: "101 Đường Bệnh Nhân, Quận 4, TP.HCM",
        },
      },
    },
  });
  console.log("Created patient:", patient.email);

  // Tạo người dùng Pharmacist
  const pharmacist = await prisma.user.create({
    data: {
      email: "pharmacist@example.com",
      first_name: "Phạm",
      last_name: "Thị D",
      password: "pharmacist123",
      role: "PHARMACIST",
      is_active: true,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          license_number: "PH12345",
          qualification: "Dược sĩ đại học",
          experience: 7,
          phone: "0945678901",
          address: "202 Đường Dược Sĩ, Quận 5, TP.HCM",
        },
      },
    },
  });
  console.log("Created pharmacist:", pharmacist.email);

  // Tạo người dùng Lab Technician
  const labTech = await prisma.user.create({
    data: {
      email: "labtech@example.com",
      first_name: "Hoàng",
      last_name: "Văn E",
      password: "labtech123",
      role: "LAB_TECH",
      is_active: true,
      date_joined: new Date(),
      last_login: new Date(),
      profile: {
        create: {
          lab_department: "Huyết học",
          qualification: "Cử nhân xét nghiệm",
          experience: 4,
          phone: "0956789012",
          address: "303 Đường Xét Nghiệm, Quận 6, TP.HCM",
        },
      },
    },
  });
  console.log("Created lab technician:", labTech.email);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
