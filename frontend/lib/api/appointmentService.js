import axios from "./axios";

const API_URL = "/api";

export const appointmentService = {
  // Quản lý khoa
  getDepartments: () => {
    return axios.get(`${API_URL}/departments`);
  },

  addDepartment: (departmentData) => {
    return axios.post(`${API_URL}/departments`, departmentData);
  },

  updateDepartment: (id, departmentData) => {
    return axios.put(`${API_URL}/departments/${id}`, departmentData);
  },

  deleteDepartment: (id) => {
    return axios.delete(`${API_URL}/departments/${id}`);
  },

  // Quản lý bác sĩ
  getDoctors: (filters = {}) => {
    return axios.get(`${API_URL}/doctors`, { params: filters });
  },

  getDoctorsByDepartment: (departmentId) => {
    return axios.get(`${API_URL}/doctors?department_id=${departmentId}`);
  },

  addDoctor: (doctorData) => {
    return axios.post(`${API_URL}/doctors`, doctorData);
  },

  updateDoctor: (id, doctorData) => {
    return axios.put(`${API_URL}/doctors/${id}`, doctorData);
  },

  deleteDoctor: (id) => {
    return axios.delete(`${API_URL}/doctors/${id}`);
  },

  // Quản lý lịch trống
  getDoctorAvailabilities: (doctorId, filters = {}) => {
    return axios.get(`${API_URL}/doctors/${doctorId}/availabilities`, {
      params: filters,
    });
  },

  addDoctorAvailability: (availabilityData) => {
    return axios.post(`${API_URL}/doctor-availabilities`, availabilityData);
  },

  deleteDoctorAvailability: (id) => {
    return axios.delete(`${API_URL}/doctor-availabilities/${id}`);
  },

  // Quản lý lịch hẹn
  getAppointments: (filters = {}) => {
    return axios.get(`${API_URL}/appointments`, { params: filters });
  },

  getMyAppointments: (status = null) => {
    const params = status ? { status } : {};
    return axios.get(`${API_URL}/appointments/my_appointments`, { params });
  },

  bookAppointment: (appointmentData) => {
    return axios.post(`${API_URL}/appointments`, appointmentData);
  },

  updateAppointmentStatus: (id, status) => {
    return axios.post(`${API_URL}/appointments/${id}/update_status`, {
      status,
    });
  },

  getAppointmentById: (id) => {
    return axios.get(`${API_URL}/appointments/${id}`);
  },
};

export default appointmentService;
