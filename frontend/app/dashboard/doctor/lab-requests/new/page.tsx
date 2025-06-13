"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";

const labRequestSchema = z.object({
  patientId: z.string().min(1, { message: "Vui lòng chọn bệnh nhân" }),
  clinicalInfo: z
    .string()
    .min(1, { message: "Vui lòng nhập thông tin lâm sàng" }),
  urgency: z.enum(["normal", "urgent", "emergency"]),
  notes: z.string().optional(),
  tests: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        selected: z.boolean(),
        specificInstructions: z.string().optional(),
      })
    )
    .refine((tests) => tests.some((test) => test.selected), {
      message: "Vui lòng chọn ít nhất một xét nghiệm",
    }),
});

type LabRequestFormValues = z.infer<typeof labRequestSchema>;

// Mock data for patients
const patients = [
  { id: "1", name: "Nguyễn Văn A", age: 45, gender: "Nam" },
  { id: "2", name: "Trần Thị B", age: 32, gender: "Nữ" },
  { id: "3", name: "Lê Văn C", age: 28, gender: "Nam" },
];

// Mock data for lab tests
const availableTests = [
  { id: "1", name: "Công thức máu toàn phần (CBC)", category: "Huyết học" },
  { id: "2", name: "Glucose máu", category: "Sinh hóa" },
  { id: "3", name: "Lipid máu", category: "Sinh hóa" },
  { id: "4", name: "Chức năng gan (AST, ALT, GGT)", category: "Sinh hóa" },
  { id: "5", name: "Chức năng thận (Urea, Creatinine)", category: "Sinh hóa" },
  { id: "6", name: "HbA1c", category: "Sinh hóa" },
  { id: "7", name: "Điện giải đồ", category: "Sinh hóa" },
  { id: "8", name: "Tổng phân tích nước tiểu", category: "Nước tiểu" },
  { id: "9", name: "X-quang ngực thẳng", category: "Chẩn đoán hình ảnh" },
  { id: "10", name: "Siêu âm ổ bụng", category: "Chẩn đoán hình ảnh" },
  { id: "11", name: "Điện tâm đồ (ECG)", category: "Tim mạch" },
  { id: "12", name: "Xét nghiệm vi sinh đờm", category: "Vi sinh" },
];

export default function NewLabRequestPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<
    (typeof patients)[0] | null
  >(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [testSearchTerm, setTestSearchTerm] = useState("");

  const form = useForm<LabRequestFormValues>({
    resolver: zodResolver(labRequestSchema),
    defaultValues: {
      patientId: "",
      clinicalInfo: "",
      urgency: "normal",
      notes: "",
      tests: availableTests.map((test) => ({
        id: test.id,
        name: test.name,
        selected: false,
        specificInstructions: "",
      })),
    },
  });

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTests = availableTests.filter(
    (test) =>
      test.name.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(testSearchTerm.toLowerCase())
  );

  const selectPatient = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.id);
    setShowPatientSearch(false);
  };

  const toggleTest = (testId: string) => {
    const currentTests = form.getValues("tests");
    const updatedTests = currentTests.map((test) =>
      test.id === testId ? { ...test, selected: !test.selected } : test
    );
    form.setValue("tests", updatedTests);
  };

  const updateTestInstructions = (testId: string, instructions: string) => {
    const currentTests = form.getValues("tests");
    const updatedTests = currentTests.map((test) =>
      test.id === testId
        ? { ...test, specificInstructions: instructions }
        : test
    );
    form.setValue("tests", updatedTests);
  };

  const onSubmit = (data: LabRequestFormValues) => {
    console.log("Lab request data:", data);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Yêu cầu xét nghiệm đã được tạo",
        description: "Yêu cầu đã được gửi đến phòng xét nghiệm",
      });
      router.push("/dashboard/doctor/lab-requests");
    }, 1500);
  };

  // Group tests by category
  const testsByCategory = filteredTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, typeof availableTests>);

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Tạo yêu cầu xét nghiệm mới</h1>

      <div className='bg-white rounded-lg shadow p-6'>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Chọn bệnh nhân */}
          <div className='mb-6'>
            <label className='block mb-2 font-medium'>Bệnh nhân</label>
            <div className='relative'>
              <input
                type='text'
                className='w-full p-3 border rounded-lg'
                placeholder='Tìm kiếm bệnh nhân...'
                value={
                  selectedPatient
                    ? `${selectedPatient.name} - ${selectedPatient.age} tuổi, ${selectedPatient.gender}`
                    : searchTerm
                }
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowPatientSearch(true);
                  setSelectedPatient(null);
                }}
                onFocus={() => setShowPatientSearch(true)}
              />
              {showPatientSearch && filteredPatients.length > 0 && (
                <div className='absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg'>
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className='p-3 hover:bg-gray-100 cursor-pointer'
                      onClick={() => selectPatient(patient)}>
                      {patient.name} - {patient.age} tuổi, {patient.gender}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin lâm sàng */}
          <div className='mb-6'>
            <label className='block mb-2 font-medium'>Thông tin lâm sàng</label>
            <textarea
              className='w-full p-3 border rounded-lg h-32'
              placeholder='Nhập thông tin lâm sàng...'
              {...form.register("clinicalInfo")}></textarea>
            {form.formState.errors.clinicalInfo && (
              <p className='text-red-500 mt-1'>
                {form.formState.errors.clinicalInfo.message}
              </p>
            )}
          </div>

          {/* Mức độ khẩn cấp */}
          <div className='mb-6'>
            <label className='block mb-2 font-medium'>Mức độ khẩn cấp</label>
            <select
              className='w-full p-3 border rounded-lg'
              {...form.register("urgency")}>
              <option value='normal'>Bình thường</option>
              <option value='urgent'>Khẩn cấp</option>
              <option value='emergency'>Cấp cứu</option>
            </select>
          </div>

          {/* Chọn xét nghiệm */}
          <div className='mb-6'>
            <label className='block mb-2 font-medium'>Chọn xét nghiệm</label>
            <input
              type='text'
              className='w-full p-3 border rounded-lg mb-4'
              placeholder='Tìm kiếm xét nghiệm...'
              value={testSearchTerm}
              onChange={(e) => setTestSearchTerm(e.target.value)}
            />

            {Object.entries(testsByCategory).map(([category, tests]) => (
              <div
                key={category}
                className='mb-6'>
                <h3 className='font-medium text-lg mb-2'>{category}</h3>
                <div className='space-y-2'>
                  {tests.map((test) => {
                    const currentTest = form
                      .getValues("tests")
                      .find((t) => t.id === test.id);
                    return (
                      <div
                        key={test.id}
                        className='border rounded-lg p-3'>
                        <div className='flex items-center mb-2'>
                          <input
                            type='checkbox'
                            id={`test-${test.id}`}
                            checked={currentTest?.selected || false}
                            onChange={() => toggleTest(test.id)}
                            className='mr-3 h-5 w-5'
                          />
                          <label
                            htmlFor={`test-${test.id}`}
                            className='font-medium'>
                            {test.name}
                          </label>
                        </div>
                        {currentTest?.selected && (
                          <div className='pl-8 mt-2'>
                            <label className='block mb-1 text-sm'>
                              Hướng dẫn cụ thể (không bắt buộc)
                            </label>
                            <textarea
                              className='w-full p-2 border rounded'
                              placeholder='Nhập hướng dẫn cụ thể...'
                              value={currentTest.specificInstructions || ""}
                              onChange={(e) =>
                                updateTestInstructions(test.id, e.target.value)
                              }></textarea>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {form.formState.errors.tests && (
              <p className='text-red-500 mt-1'>
                {form.formState.errors.tests.message}
              </p>
            )}
          </div>

          {/* Ghi chú */}
          <div className='mb-6'>
            <label className='block mb-2 font-medium'>
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              className='w-full p-3 border rounded-lg h-24'
              placeholder='Nhập ghi chú thêm...'
              {...form.register("notes")}></textarea>
          </div>

          {/* Nút gửi */}
          <div className='flex justify-end'>
            <button
              type='button'
              className='px-6 py-3 mr-3 border rounded-lg'
              onClick={() => router.back()}>
              Hủy
            </button>
            <button
              type='submit'
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
              Tạo yêu cầu xét nghiệm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
