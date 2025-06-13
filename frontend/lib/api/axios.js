import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    const isBrowser = typeof window !== "undefined";

    // Lấy token từ localStorage nếu đang ở trình duyệt
    if (isBrowser) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      // Lỗi 401 - Unauthorized: Redirect to login
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Lỗi 403 - Forbidden: Không có quyền truy cập
      if (error.response.status === 403) {
        console.error("Bạn không có quyền thực hiện hành động này");
      }

      // Lỗi 500 - Server Error
      if (error.response.status >= 500) {
        console.error("Đã có lỗi xảy ra từ máy chủ");
      }
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không thể kết nối đến máy chủ");
    } else {
      // Lỗi khác
      console.error("Đã có lỗi xảy ra", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
