import axios from "axios";

// Lấy URL API từ biến môi trường hoặc sử dụng URL mặc định
// Lưu ý: Để tránh lặp lại /api/ trong URL, chúng ta sẽ sử dụng URL gốc
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

console.log("API URL:", API_BASE_URL); // Ghi log để debug

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Thêm timeout để tránh chờ quá lâu
  timeout: 10000,
  // Bỏ qua lỗi SSL trong môi trường phát triển
  httpsAgent: new (require("https").Agent)({
    rejectUnauthorized: false,
  }),
});

// Interceptor để thêm token vào header và log request
apiClient.interceptors.request.use(
  (config) => {
    // Log request để debug chi tiết hơn
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data:
        typeof config.data === "string" ? JSON.parse(config.data) : config.data,
      params: config.params,
      headers: config.headers,
    });

    // Thêm token vào header nếu có
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý refresh token khi token hết hạn và log response
apiClient.interceptors.response.use(
  (response) => {
    // Log response để debug
    console.log(
      `[API Response] ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        data: response.data,
        headers: response.headers,
      }
    );
    return response;
  },
  async (error) => {
    // Log lỗi response để debug chi tiết hơn
    console.error(
      `[API Error] ${error.response?.status || "Unknown"} ${
        error.config?.method?.toUpperCase() || "Unknown"
      } ${error.config?.url || "Unknown"}`,
      {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data:
            typeof error.config?.data === "string"
              ? JSON.parse(error.config?.data)
              : error.config?.data,
          headers: error.config?.headers,
        },
      }
    );

    // Log chi tiết hơn về lỗi
    if (error.response?.data) {
      console.error(
        "API Error Details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    const originalRequest = error.config;

    // Kiểm tra xem lỗi có phải do mạng không
    if (error.message === "Network Error") {
      console.error("Network error - không thể kết nối đến API:", API_BASE_URL);
      return Promise.reject({
        ...error,
        response: {
          data: {
            detail:
              "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc thử lại sau.",
          },
        },
      });
    }

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          // Gọi API refresh token
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;

          // Lưu token mới
          localStorage.setItem("token", access);

          // Cập nhật header cho request hiện tại
          originalRequest.headers.Authorization = `Bearer ${access}`;

          // Thử lại request ban đầu
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Không thể refresh token:", refreshError);

        // Xóa token và thông tin người dùng
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Chuyển hướng đến trang đăng nhập nếu cần
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Method trợ giúp để kiểm tra thông tin người dùng hiện tại
apiClient.getCurrentUser = async function () {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found when getting current user");
      return null;
    }

    // Log token đang dùng để debug
    console.log(
      "Using token for getCurrentUser:",
      `${token.substring(0, 15)}...`
    );

    // Gọi API để lấy thông tin người dùng hiện tại
    const response = await this.get("/api/users/me/");
    console.log("Current user API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error getting current user:",
      error.response?.status,
      error.response?.data || error.message
    );

    return null;
  }
};

export default apiClient;
