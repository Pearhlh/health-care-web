import apiClient from "./api-client";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  doctor_profile?: {
    id: number;
  };
  patient_profile?: {
    id: number;
  };
  nurse_profile?: {
    id: number;
  };
  pharmacist_profile?: {
    id: number;
  };
  lab_technician_profile?: {
    id: number;
  };
  admin_profile?: {
    id: number;
  };
  insurance_provider_profile?: {
    id: number;
  };
}

export interface PatientProfile {
  id: number;
  user: number;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  height: number;
  weight: number;
  allergies: string;
  medical_conditions: string;
  current_medications: string;
  family_medical_history: string;
  primary_language: string;
  requires_translator: boolean;
  marital_status: string;
  occupation: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: number;
  user: number;
  specialization: string;
  secondary_specialization: string;
  license_number: string;
  license_expiry_date: string;
  years_of_experience: number;
  education: string;
  board_certifications: string;
  consultation_fee: number;
  availability_status: string;
  max_patients_per_day: number;
  languages_spoken: string;
  department: string;
  short_bio: string;
  working_days: string;
  working_hours: string;
  created_at: string;
  updated_at: string;
}

export interface NurseProfile {
  id: number;
  user: number;
  license_number: string;
  license_expiry_date: string;
  nurse_type: string;
  department: string;
  specialization: string;
  years_of_experience: number;
  education: string;
  certifications: string;
  shift_preference: string;
  languages_spoken: string;
  created_at: string;
  updated_at: string;
}

export interface PharmacistProfile {
  id: number;
  user: number;
  license_number: string;
  years_of_experience: number;
  specialization: string;
  pharmacy_name: string;
  license_expiry_date: string;
  education: string;
  certifications: string;
  languages_spoken: string;
  created_at: string;
  updated_at: string;
}

export interface LabTechnicianProfile {
  id: number;
  user: number;
  license_number: string;
  specialization: string;
  laboratory_name: string;
  years_of_experience: number;
  license_expiry_date: string;
  education: string;
  certifications: string;
  equipment_expertise: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: number;
  user: number;
  admin_type: string;
  employee_id: string;
  position: string;
  access_level: number;
  department: string;
  responsibilities: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceProviderProfile {
  id: number;
  user: number;
  company_name: string;
  provider_id: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  service_areas: string;
  available_plans: string;
  website: string;
  established_year: number;
  created_at: string;
  updated_at: string;
}

const UserService = {
  // User management
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get("/api/users/me/");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get("/api/users/");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get(`/api/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  async createUser(userData: any): Promise<User> {
    try {
      const response = await apiClient.post("/api/users/", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put(`/api/users/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${id}/`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // Profile management - unified approach
  async getUserProfile(userId: number, role: string): Promise<any> {
    try {
      // Ưu tiên gọi endpoint chuẩn hóa
      const response = await apiClient.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Nếu chưa có profile thì trả về object rỗng để FE hiển thị form tạo mới
        return {};
      }
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  },

  async updateUserProfile(
    userId: number,
    role: string,
    data: any
  ): Promise<any> {
    try {
      let endpoint = "";
      switch (role) {
        case "DOCTOR":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "PATIENT":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "NURSE":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "PHARMACIST":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "LAB_TECH":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "ADMIN":
          endpoint = `/api/users/${userId}/profile`;
          break;
        case "INSURANCE":
          endpoint = `/api/users/${userId}/profile`;
          break;
        default:
          throw new Error(`Unsupported role: ${role}`);
      }

      // Chuẩn bị dữ liệu profile
      const profileData = {
        profile: {
          ...data,
          role: role, // Thêm role vào profile
        },
      };

      const response = await apiClient.put(endpoint, profileData);
      return response.data;
    } catch (error) {
      console.error(
        `Error updating ${role} profile for user ${userId}:`,
        error
      );
      throw error;
    }
  },

  // Specific profile methods for backward compatibility
  async getPatientProfile(userId: number): Promise<PatientProfile> {
    return this.getUserProfile(userId, "PATIENT");
  },

  async updatePatientProfile(
    userId: number,
    data: Partial<PatientProfile>
  ): Promise<PatientProfile> {
    return this.updateUserProfile(userId, "PATIENT", data);
  },

  async getDoctorProfile(userId: number): Promise<DoctorProfile> {
    return this.getUserProfile(userId, "DOCTOR");
  },

  async updateDoctorProfile(
    userId: number,
    data: Partial<DoctorProfile>
  ): Promise<DoctorProfile> {
    return this.updateUserProfile(userId, "DOCTOR", data);
  },

  async getNurseProfile(userId: number): Promise<NurseProfile> {
    return this.getUserProfile(userId, "NURSE");
  },

  async updateNurseProfile(
    userId: number,
    data: Partial<NurseProfile>
  ): Promise<NurseProfile> {
    return this.updateUserProfile(userId, "NURSE", data);
  },

  async getPharmacistProfile(userId: number): Promise<PharmacistProfile> {
    return this.getUserProfile(userId, "PHARMACIST");
  },

  async updatePharmacistProfile(
    userId: number,
    data: Partial<PharmacistProfile>
  ): Promise<PharmacistProfile> {
    return this.updateUserProfile(userId, "PHARMACIST", data);
  },

  async getLabTechnicianProfile(userId: number): Promise<LabTechnicianProfile> {
    return this.getUserProfile(userId, "LAB_TECH");
  },

  async updateLabTechnicianProfile(
    userId: number,
    data: Partial<LabTechnicianProfile>
  ): Promise<LabTechnicianProfile> {
    return this.updateUserProfile(userId, "LAB_TECH", data);
  },

  async getAdminProfile(userId: number): Promise<AdminProfile> {
    return this.getUserProfile(userId, "ADMIN");
  },

  async updateAdminProfile(
    userId: number,
    data: Partial<AdminProfile>
  ): Promise<AdminProfile> {
    return this.updateUserProfile(userId, "ADMIN", data);
  },

  async getInsuranceProviderProfile(
    userId: number
  ): Promise<InsuranceProviderProfile> {
    return this.getUserProfile(userId, "INSURANCE");
  },

  async updateInsuranceProviderProfile(
    userId: number,
    data: Partial<InsuranceProviderProfile>
  ): Promise<InsuranceProviderProfile> {
    return this.updateUserProfile(userId, "INSURANCE", data);
  },

  // Role and specialty management
  async getRoles(): Promise<string[]> {
    try {
      const response = await apiClient.get("/api/roles/");
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [
        "ADMIN",
        "DOCTOR",
        "PATIENT",
        "NURSE",
        "PHARMACIST",
        "LAB_TECH",
        "INSURANCE",
      ];
    }
  },

  async getSpecialties(): Promise<string[]> {
    try {
      const response = await apiClient.get("/api/specialties/");
      return response.data;
    } catch (error) {
      console.error("Error fetching specialties:", error);
      return [
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "Neurology",
        "Obstetrics",
        "Oncology",
        "Ophthalmology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Radiology",
        "Urology",
      ];
    }
  },

  async getDepartments(): Promise<string[]> {
    try {
      const response = await apiClient.get("/api/departments/");
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [
        "Emergency",
        "ICU",
        "Pediatrics",
        "Cardiology",
        "Oncology",
        "Neurology",
        "Orthopedics",
        "General",
        "Surgery",
        "Obstetrics",
      ];
    }
  },
};

export default UserService;
