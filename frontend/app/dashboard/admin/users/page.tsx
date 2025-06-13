"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserService from "@/lib/api/user-service";
import AuthService from "@/lib/api/auth-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Plus, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

const DEPARTMENTS = [
  { value: "NOI", label: "Nội" },
  { value: "NGOAI", label: "Ngoại" },
  { value: "SAN", label: "Sản" },
  { value: "NHI", label: "Nhi" },
  { value: "KHAC", label: "Khác" },
];
const SPECIALTIES: Record<string, { value: string; label: string }[]> = {
  NOI: [
    { value: "NOI_TIM_MACH", label: "Nội Tim Mạch" },
    { value: "NOI_TIEU_HOA", label: "Nội Tiêu Hóa" },
    { value: "NOI_HO_HAP", label: "Nội Hô Hấp" },
    { value: "NOI_THAN", label: "Nội Thận" },
    { value: "NOI_TIET", label: "Nội Tiết" },
    { value: "NOI_THAN_KINH", label: "Nội Thần Kinh" },
    { value: "NOI_DA_LIEU", label: "Nội Da Liễu" },
    { value: "NOI_TONG_QUAT", label: "Nội Tổng Quát" },
  ],
  NGOAI: [
    { value: "NGOAI_CHINH_HINH", label: "Ngoại Chỉnh Hình" },
    { value: "NGOAI_TIET_NIEU", label: "Ngoại Tiết Niệu" },
    { value: "NGOAI_THAN_KINH", label: "Ngoại Thần Kinh" },
    { value: "NGOAI_LONG_NGUC", label: "Ngoại Lồng Ngực" },
    { value: "NGOAI_TIEU_HOA", label: "Ngoại Tiêu Hóa" },
    { value: "NGOAI_TONG_QUAT", label: "Ngoại Tổng Quát" },
  ],
  SAN: [
    { value: "SAN_KHOA", label: "Sản Khoa" },
    { value: "PHU_KHOA", label: "Phụ Khoa" },
    { value: "VO_SINH", label: "Vô Sinh" },
  ],
  NHI: [
    { value: "NHI_TONG_QUAT", label: "Nhi Tổng Quát" },
    { value: "NHI_TIM_MACH", label: "Nhi Tim Mạch" },
    { value: "NHI_THAN_KINH", label: "Nhi Thần Kinh" },
    { value: "NHI_SO_SINH", label: "Nhi Sơ Sinh" },
  ],
  KHAC: [
    { value: "MAT", label: "Mắt" },
    { value: "TAI_MUI_HONG", label: "Tai Mũi Họng" },
    { value: "RANG_HAM_MAT", label: "Răng Hàm Mặt" },
    { value: "TAM_THAN", label: "Tâm Thần" },
    { value: "UNG_BUOU", label: "Ung Bướu" },
    { value: "DA_KHOA", label: "Đa Khoa" },
    { value: "KHAC", label: "Khác" },
  ],
};

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<any>({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    is_active: true,
  });
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "PATIENT",
    is_active: true,
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        try {
          await login();
        } catch (error: any) {
          setError("Không thể đăng nhập tự động: " + error.message);
        }
      } else {
        setIsLoggedIn(true);
        fetchUsers();
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (editModalOpen && editForm.role === "DOCTOR") {
      setSelectedDepartment(editForm.department || "");
    }
    if (!editModalOpen) {
      setSelectedDepartment("");
    }
  }, [editModalOpen, editForm.role, editForm.department]);

  const login = async () => {
    setLoading(true);
    try {
      const result = await AuthService.login({
        email: "LHuy1902003@gmail.com",
        password: "Huycode12003",
      });
      setIsLoggedIn(true);
      fetchUsers();
    } catch (error: any) {
      setError(
        "Không thể đăng nhập: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (error: any) {
      setError(
        "Có lỗi xảy ra khi tải dữ liệu người dùng: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (user: User) => {
    setCurrentUser(user);
    try {
      // Lấy thông tin cơ bản của user
      const userDetails = await UserService.getUserById(user.id);

      // Khởi tạo form với thông tin cơ bản
      const initialForm = {
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        email: userDetails.email,
        role: userDetails.role,
        is_active: userDetails.is_active,
      };

      try {
        // Lấy thông tin profile mới nhất của user theo vai trò
        const profileDetails = await UserService.getUserProfile(
          user.id,
          userDetails.role
        );

        // Kết hợp thông tin cơ bản và profile
        setEditForm({
          ...initialForm,
          ...profileDetails,
        });
      } catch (profileError) {
        console.error("Không thể tải thông tin profile:", profileError);
        setEditForm(initialForm);
      }

      setEditModalOpen(true);
    } catch (error: any) {
      setError("Không thể tải chi tiết người dùng: " + error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setEditForm((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRoleChange = (value: string) => {
    setAddForm((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleAddActiveChange = (checked: boolean) => {
    setAddForm((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const payload = { ...editForm };
      console.log("Original form data:", payload);

      // Loại bỏ các trường thông tin cơ bản của người dùng
      const profileData = { ...payload };
      delete profileData.first_name;
      delete profileData.last_name;
      delete profileData.email;
      delete profileData.role;
      delete profileData.is_active;

      console.log("Profile data to update:", profileData);
      console.log("User ID:", currentUser.id);
      console.log("User role:", payload.role);

      // Chỉ cập nhật profile nếu có dữ liệu
      if (Object.keys(profileData).length > 0) {
        try {
          const result = await UserService.updateUserProfile(
            currentUser.id,
            payload.role,
            profileData
          );
          console.log("Profile update result:", result);
        } catch (profileError: any) {
          console.error("Error updating profile:", profileError);
          console.error("Error details:", profileError.response?.data);
          throw profileError;
        }
      } else {
        console.log("No profile data to update");
      }

      fetchUsers();
      setEditModalOpen(false);
      setError(null);

      toast({
        title: "Cập nhật thành công",
        description: `Thông tin profile của ${payload.first_name} ${payload.last_name} đã được cập nhật.`,
        variant: "default",
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      console.error("Full error object:", error);
      setError("Có lỗi xảy ra khi cập nhật profile: " + errorMessage);

      toast({
        title: "Cập nhật thất bại",
        description: `Không thể cập nhật thông tin profile: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    setLoading(true);
    try {
      // Tạo người dùng mới
      const newUser = await UserService.createUser(addForm);

      // Nếu tạo người dùng thành công và có vai trò, tạo profile tương ứng
      if (newUser && newUser.id && addForm.role) {
        try {
          // Tạo profile mặc định theo vai trò
          const defaultProfileData: any = {};

          if (addForm.role === "PATIENT") {
            defaultProfileData.primary_language = "Vietnamese";
          } else if (addForm.role === "DOCTOR") {
            defaultProfileData.availability_status = "AVAILABLE";
          } else if (addForm.role === "NURSE") {
            defaultProfileData.shift_preference = "MORNING";
          }

          // Tạo profile cho người dùng mới
          await UserService.updateUserProfile(
            newUser.id,
            addForm.role,
            defaultProfileData
          );
          console.log(
            "Created default profile for new user:",
            defaultProfileData
          );
        } catch (profileError: any) {
          console.error("Error creating profile for new user:", profileError);
          // Vẫn tiếp tục vì người dùng đã được tạo
        }
      }

      fetchUsers();
      setAddModalOpen(false);
      setAddForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "PATIENT",
        is_active: true,
      });
      setError(null);

      toast({
        title: "Tạo người dùng thành công",
        description: `Người dùng ${addForm.first_name} ${addForm.last_name} đã được tạo.`,
        variant: "default",
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      setError("Có lỗi xảy ra khi tạo người dùng: " + errorMessage);

      toast({
        title: "Tạo người dùng thất bại",
        description: `Không thể tạo người dùng: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    setLoading(true);
    try {
      await UserService.deleteUser(userId);
      fetchUsers();
      setError(null);

      toast({
        title: "Xóa người dùng thành công",
        description: "Người dùng đã được xóa khỏi hệ thống.",
        variant: "default",
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      setError("Có lỗi xảy ra khi xóa người dùng: " + errorMessage);

      toast({
        title: "Xóa người dùng thất bại",
        description: `Không thể xóa người dùng: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      DOCTOR: "bg-blue-100 text-blue-800",
      NURSE: "bg-purple-100 text-purple-800",
      PATIENT: "bg-green-100 text-green-800",
      PHARMACIST: "bg-cyan-100 text-cyan-800",
      LAB_TECH: "bg-orange-100 text-orange-800",
      INSURANCE: "bg-yellow-100 text-yellow-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleTranslation = (role: string) => {
    const roleTranslations: Record<string, string> = {
      ADMIN: "Quản trị viên",
      DOCTOR: "Bác sĩ",
      NURSE: "Y tá",
      PATIENT: "Bệnh nhân",
      PHARMACIST: "Dược sĩ",
      LAB_TECH: "Kỹ thuật viên",
      INSURANCE: "Bảo hiểm",
    };
    return roleTranslations[role] || role;
  };

  const renderEditDialogContent = () => {
    const commonFields = (
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='first_name'>Họ</Label>
          <Input
            id='first_name'
            name='first_name'
            value={editForm.first_name}
            onChange={handleInputChange}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='last_name'>Tên</Label>
          <Input
            id='last_name'
            name='last_name'
            value={editForm.last_name}
            onChange={handleInputChange}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            value={editForm.email}
            onChange={handleInputChange}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='role'>Vai trò</Label>
          <Select
            value={editForm.role}
            onValueChange={(value) => handleSelectChange("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder='Chọn vai trò' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ADMIN'>Quản trị viên</SelectItem>
              <SelectItem value='DOCTOR'>Bác sĩ</SelectItem>
              <SelectItem value='PATIENT'>Bệnh nhân</SelectItem>
              <SelectItem value='NURSE'>Y tá</SelectItem>
              <SelectItem value='PHARMACIST'>Dược sĩ</SelectItem>
              <SelectItem value='LAB_TECH'>Kỹ thuật viên</SelectItem>
              <SelectItem value='INSURANCE'>Bảo hiểm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='is_active'>Trạng thái</Label>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='is_active'
              checked={editForm.is_active}
              onCheckedChange={(checked) =>
                handleCheckboxChange("is_active", checked as boolean)
              }
            />
            <Label htmlFor='is_active'>Kích hoạt</Label>
          </div>
        </div>
      </div>
    );

    switch (editForm.role) {
      case "PATIENT":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date_of_birth'>Ngày sinh</Label>
                <Input
                  id='date_of_birth'
                  name='date_of_birth'
                  type='date'
                  value={editForm.date_of_birth || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='gender'>Giới tính</Label>
                <Select
                  value={editForm.gender || ""}
                  onValueChange={(value) =>
                    handleSelectChange("gender", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn giới tính' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='M'>Nam</SelectItem>
                    <SelectItem value='F'>Nữ</SelectItem>
                    <SelectItem value='O'>Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='blood_type'>Nhóm máu</Label>
                <Select
                  value={editForm.blood_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("blood_type", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn nhóm máu' />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={type}>
                          {type}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='height'>Chiều cao (cm)</Label>
                <Input
                  id='height'
                  name='height'
                  type='number'
                  value={editForm.height || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='weight'>Cân nặng (kg)</Label>
                <Input
                  id='weight'
                  name='weight'
                  type='number'
                  value={editForm.weight || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='allergies'>Dị ứng</Label>
                <Input
                  id='allergies'
                  name='allergies'
                  value={editForm.allergies || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='medical_conditions'>Tình trạng y tế</Label>
                <Input
                  id='medical_conditions'
                  name='medical_conditions'
                  value={editForm.medical_conditions || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='primary_language'>Ngôn ngữ chính</Label>
                <Input
                  id='primary_language'
                  name='primary_language'
                  value={editForm.primary_language || "English"}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='requires_translator'>Cần thông dịch viên</Label>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='requires_translator'
                    checked={editForm.requires_translator || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "requires_translator",
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor='requires_translator'>Có</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case "DOCTOR":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='department'>Khoa</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    handleSelectChange("department", value);
                    handleSelectChange("specialization", "");
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn khoa' />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dep) => (
                      <SelectItem
                        key={dep.value}
                        value={dep.value}>
                        {dep.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='specialization'>Chuyên khoa</Label>
                <Select
                  value={editForm.specialization || ""}
                  onValueChange={(value) =>
                    handleSelectChange("specialization", value)
                  }
                  disabled={!selectedDepartment}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedDepartment
                          ? "Chọn chuyên khoa"
                          : "Chọn khoa trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDepartment &&
                      SPECIALTIES[selectedDepartment]?.map((spec) => (
                        <SelectItem
                          key={spec.value}
                          value={spec.value}>
                          {spec.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='license_number'>Số giấy phép</Label>
                <Input
                  id='license_number'
                  name='license_number'
                  value={editForm.license_number || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='years_of_experience'>Số năm kinh nghiệm</Label>
                <Input
                  id='years_of_experience'
                  name='years_of_experience'
                  type='number'
                  value={editForm.years_of_experience || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='consultation_fee'>Phí tư vấn</Label>
                <Input
                  id='consultation_fee'
                  name='consultation_fee'
                  type='number'
                  value={editForm.consultation_fee || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='availability_status'>Trạng thái sẵn sàng</Label>
                <Select
                  value={editForm.availability_status || ""}
                  onValueChange={(value) =>
                    handleSelectChange("availability_status", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='AVAILABLE'>Sẵn sàng</SelectItem>
                    <SelectItem value='UNAVAILABLE'>Không sẵn sàng</SelectItem>
                    <SelectItem value='ON_LEAVE'>Nghỉ phép</SelectItem>
                    <SelectItem value='EMERGENCY_ONLY'>Chỉ cấp cứu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='working_days'>Ngày làm việc</Label>
                <Input
                  id='working_days'
                  name='working_days'
                  value={editForm.working_days || ""}
                  onChange={handleInputChange}
                  placeholder='MON,TUE,WED,THU,FRI'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='working_hours'>Giờ làm việc</Label>
                <Input
                  id='working_hours'
                  name='working_hours'
                  value={editForm.working_hours || ""}
                  onChange={handleInputChange}
                  placeholder='08:00-17:00'
                />
              </div>
            </div>
          </div>
        );

      case "NURSE":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='license_number'>Số giấy phép</Label>
                <Input
                  id='license_number'
                  name='license_number'
                  value={editForm.license_number || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='nurse_type'>Loại y tá</Label>
                <Select
                  value={editForm.nurse_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("nurse_type", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn loại y tá' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='RN'>Registered Nurse</SelectItem>
                    <SelectItem value='LPN'>
                      Licensed Practical Nurse
                    </SelectItem>
                    <SelectItem value='NP'>Nurse Practitioner</SelectItem>
                    <SelectItem value='CNA'>
                      Certified Nursing Assistant
                    </SelectItem>
                    <SelectItem value='SPECIALIST'>Specialist Nurse</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='department'>Khoa</Label>
                <Select
                  value={editForm.department || ""}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn khoa' />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "KHOA_NOI",
                      "KHOA_NGOAI",
                      "KHOA_SAN",
                      "KHOA_NHI",
                      "KHOA_CAP_CUU",
                      "KHOA_XET_NGHIEM",
                      "KHOA_CHAN_DOAN_HINH_ANH",
                      "KHOA_MAT",
                      "KHOA_TMH",
                      "KHOA_RHM",
                      "KHOA_UNG_BUOU",
                      "KHOA_HOI_SUC",
                      "KHOA_KHAC",
                    ].map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}>
                        {dept.replace("KHOA_", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='shift_preference'>Ca làm việc ưu tiên</Label>
                <Select
                  value={editForm.shift_preference || ""}
                  onValueChange={(value) =>
                    handleSelectChange("shift_preference", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn ca' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MORNING'>Buổi sáng</SelectItem>
                    <SelectItem value='AFTERNOON'>Buổi chiều</SelectItem>
                    <SelectItem value='NIGHT'>Buổi tối</SelectItem>
                    <SelectItem value='ROTATING'>Luân phiên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='years_of_experience'>Số năm kinh nghiệm</Label>
                <Input
                  id='years_of_experience'
                  name='years_of_experience'
                  type='number'
                  value={editForm.years_of_experience || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='specialization'>Chuyên môn</Label>
                <Input
                  id='specialization'
                  name='specialization'
                  value={editForm.specialization || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case "PHARMACIST":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='license_number'>Số giấy phép</Label>
                <Input
                  id='license_number'
                  name='license_number'
                  value={editForm.license_number || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='specialization'>Chuyên môn</Label>
                <Select
                  value={editForm.specialization || ""}
                  onValueChange={(value) =>
                    handleSelectChange("specialization", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn chuyên môn' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CLINICAL'>
                      Clinical Pharmacist
                    </SelectItem>
                    <SelectItem value='RETAIL'>Retail Pharmacist</SelectItem>
                    <SelectItem value='HOSPITAL'>
                      Hospital Pharmacist
                    </SelectItem>
                    <SelectItem value='RESEARCH'>
                      Research Pharmacist
                    </SelectItem>
                    <SelectItem value='INDUSTRIAL'>
                      Industrial Pharmacist
                    </SelectItem>
                    <SelectItem value='CONSULTANT'>
                      Consultant Pharmacist
                    </SelectItem>
                    <SelectItem value='ONCOLOGY'>
                      Oncology Pharmacist
                    </SelectItem>
                    <SelectItem value='PEDIATRIC'>
                      Pediatric Pharmacist
                    </SelectItem>
                    <SelectItem value='GERIATRIC'>
                      Geriatric Pharmacist
                    </SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pharmacy_name'>Tên nhà thuốc</Label>
                <Input
                  id='pharmacy_name'
                  name='pharmacy_name'
                  value={editForm.pharmacy_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='years_of_experience'>Số năm kinh nghiệm</Label>
                <Input
                  id='years_of_experience'
                  name='years_of_experience'
                  type='number'
                  value={editForm.years_of_experience || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='is_pharmacy_manager'>Quản lý nhà thuốc</Label>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='is_pharmacy_manager'
                    checked={editForm.is_pharmacy_manager || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "is_pharmacy_manager",
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor='is_pharmacy_manager'>Có</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case "LAB_TECH":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='license_number'>Số giấy phép</Label>
                <Input
                  id='license_number'
                  name='license_number'
                  value={editForm.license_number || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='specialization'>Chuyên môn</Label>
                <Select
                  value={editForm.specialization || ""}
                  onValueChange={(value) =>
                    handleSelectChange("specialization", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn chuyên môn' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='HEMATOLOGY'>Hematology</SelectItem>
                    <SelectItem value='MICROBIOLOGY'>Microbiology</SelectItem>
                    <SelectItem value='BIOCHEMISTRY'>Biochemistry</SelectItem>
                    <SelectItem value='IMMUNOLOGY'>Immunology</SelectItem>
                    <SelectItem value='PATHOLOGY'>Pathology</SelectItem>
                    <SelectItem value='TOXICOLOGY'>Toxicology</SelectItem>
                    <SelectItem value='GENETICS'>Genetics</SelectItem>
                    <SelectItem value='GENERAL'>General Laboratory</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='laboratory_name'>Tên phòng thí nghiệm</Label>
                <Input
                  id='laboratory_name'
                  name='laboratory_name'
                  value={editForm.laboratory_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='years_of_experience'>Số năm kinh nghiệm</Label>
                <Input
                  id='years_of_experience'
                  name='years_of_experience'
                  type='number'
                  value={editForm.years_of_experience || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='equipment_expertise'>Thiết bị thành thạo</Label>
                <Input
                  id='equipment_expertise'
                  name='equipment_expertise'
                  value={editForm.equipment_expertise || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case "INSURANCE":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='company_name'>Tên công ty</Label>
                <Input
                  id='company_name'
                  name='company_name'
                  value={editForm.company_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='provider_id'>ID nhà cung cấp</Label>
                <Input
                  id='provider_id'
                  name='provider_id'
                  value={editForm.provider_id || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contact_person'>Người liên hệ</Label>
                <Input
                  id='contact_person'
                  name='contact_person'
                  value={editForm.contact_person || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contact_email'>Email liên hệ</Label>
                <Input
                  id='contact_email'
                  name='contact_email'
                  type='email'
                  value={editForm.contact_email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contact_phone'>Số điện thoại liên hệ</Label>
                <Input
                  id='contact_phone'
                  name='contact_phone'
                  value={editForm.contact_phone || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='service_areas'>Khu vực dịch vụ</Label>
                <Input
                  id='service_areas'
                  name='service_areas'
                  value={editForm.service_areas || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case "ADMIN":
        return (
          <div className='space-y-4'>
            {commonFields}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='admin_type'>Loại quản trị viên</Label>
                <Select
                  value={editForm.admin_type || ""}
                  onValueChange={(value) =>
                    handleSelectChange("admin_type", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn loại quản trị viên' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='SYSTEM'>System Administrator</SelectItem>
                    <SelectItem value='HOSPITAL'>
                      Hospital Administrator
                    </SelectItem>
                    <SelectItem value='DEPARTMENT'>
                      Department Administrator
                    </SelectItem>
                    <SelectItem value='CLINIC'>Clinic Administrator</SelectItem>
                    <SelectItem value='BILLING'>
                      Billing Administrator
                    </SelectItem>
                    <SelectItem value='HR'>
                      Human Resources Administrator
                    </SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Mã nhân viên</Label>
                <Input
                  id='employee_id'
                  name='employee_id'
                  value={editForm.employee_id || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='position'>Vị trí</Label>
                <Input
                  id='position'
                  name='position'
                  value={editForm.position || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='access_level'>Mức truy cập</Label>
                <Select
                  value={editForm.access_level?.toString() || ""}
                  onValueChange={(value) =>
                    handleSelectChange("access_level", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn mức truy cập' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>Level 1 - Basic Access</SelectItem>
                    <SelectItem value='2'>Level 2 - Standard Access</SelectItem>
                    <SelectItem value='3'>Level 3 - Enhanced Access</SelectItem>
                    <SelectItem value='4'>Level 4 - Advanced Access</SelectItem>
                    <SelectItem value='5'>Level 5 - Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='department'>Phòng ban</Label>
                <Input
                  id='department'
                  name='department'
                  value={editForm.department || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='responsibilities'>Trách nhiệm</Label>
                <Input
                  id='responsibilities'
                  name='responsibilities'
                  value={editForm.responsibilities || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div className='space-y-4'>{commonFields}</div>;
    }
  };

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý người dùng</h1>
        <div className='flex gap-2'>
          <Button
            onClick={() => setAddModalOpen(true)}
            className='bg-green-600 hover:bg-green-700'>
            <Plus className='h-4 w-4 mr-2' />
            Thêm người dùng
          </Button>
          {!isLoggedIn ? (
            <Button
              onClick={login}
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700'>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          ) : (
            <Button
              onClick={fetchUsers}
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700'>
              {loading ? "Đang tải..." : "Làm mới"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-100 text-red-700 rounded-md'>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='py-2 px-4 border-b text-left'>ID</th>
                <th className='py-2 px-4 border-b text-left'>Họ tên</th>
                <th className='py-2 px-4 border-b text-left'>Email</th>
                <th className='py-2 px-4 border-b text-left'>Vai trò</th>
                <th className='py-2 px-4 border-b text-left'>Trạng thái</th>
                <th className='py-2 px-4 border-b text-left'>Ngày tham gia</th>
                <th className='py-2 px-4 border-b text-left'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className='hover:bg-gray-50'>
                  <td className='py-2 px-4 border-b'>{user.id}</td>
                  <td className='py-2 px-4 border-b'>{`${
                    user.first_name || ""
                  } ${user.last_name || ""}`}</td>
                  <td className='py-2 px-4 border-b'>{user.email}</td>
                  <td className='py-2 px-4 border-b'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                        user.role
                      )}`}>
                      {getRoleTranslation(user.role)}
                    </span>
                  </td>
                  <td className='py-2 px-4 border-b'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {user.is_active ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-1'
                        onClick={() => handleEditUser(user)}>
                        <Edit2 className='h-4 w-4' />
                        Sửa
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50'
                        onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className='h-4 w-4' />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className='py-4 px-4 text-center text-gray-500'>
                    Không có dữ liệu người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chỉnh sửa người dùng */}
      <Dialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          {renderEditDialogContent()}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? (
                <span className='flex items-center'>
                  <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                  Đang lưu...
                </span>
              ) : (
                <span className='flex items-center'>
                  <Check className='h-4 w-4 mr-2' />
                  Lưu thay đổi
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal thêm người dùng */}
      <Dialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='add_first_name'>Họ</Label>
                <Input
                  id='add_first_name'
                  name='first_name'
                  value={addForm.first_name}
                  onChange={handleAddInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='add_last_name'>Tên</Label>
                <Input
                  id='add_last_name'
                  name='last_name'
                  value={addForm.last_name}
                  onChange={handleAddInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='add_email'>Email</Label>
                <Input
                  id='add_email'
                  name='email'
                  type='email'
                  value={addForm.email}
                  onChange={handleAddInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='add_password'>Mật khẩu</Label>
                <Input
                  id='add_password'
                  name='password'
                  type='password'
                  value={addForm.password}
                  onChange={handleAddInputChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='add_role'>Vai trò</Label>
                <Select
                  value={addForm.role}
                  onValueChange={handleAddRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn vai trò' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ADMIN'>Quản trị viên</SelectItem>
                    <SelectItem value='DOCTOR'>Bác sĩ</SelectItem>
                    <SelectItem value='PATIENT'>Bệnh nhân</SelectItem>
                    <SelectItem value='NURSE'>Y tá</SelectItem>
                    <SelectItem value='PHARMACIST'>Dược sĩ</SelectItem>
                    <SelectItem value='LAB_TECH'>Kỹ thuật viên</SelectItem>
                    <SelectItem value='INSURANCE'>Bảo hiểm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='add_is_active'>Trạng thái</Label>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='add_is_active'
                    checked={addForm.is_active}
                    onCheckedChange={handleAddActiveChange}
                  />
                  <Label htmlFor='add_is_active'>Kích hoạt</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setAddModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={loading}>
              {loading ? (
                <span className='flex items-center'>
                  <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                  Đang tạo...
                </span>
              ) : (
                <span className='flex items-center'>
                  <Plus className='h-4 w-4 mr-2' />
                  Tạo người dùng
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
