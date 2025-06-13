"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function LoginTestPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login/",
        {
          email,
          password,
        }
      );

      const { access, refresh, user } = response.data;
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      if (user?.role) {
        localStorage.setItem("userRole", user.role);
      }

      toast.success("Đăng nhập thành công");

      // Redirect to the appropriate dashboard based on user role
      const userRole = (user?.role || "patient").toLowerCase();
      router.push(`/dashboard/${userRole}`);
    } catch (error: any) {
      console.error(
        "Login error:",
        error?.response?.data || error?.message || error
      );

      let errorMessage = "Không thể đăng nhập. Vui lòng thử lại sau.";

      if (error?.response?.status === 404) {
        errorMessage = "Lỗi máy chủ: API đăng nhập không được tìm thấy.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Email hoặc mật khẩu không chính xác.";
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message && error.message.includes("Network Error")) {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      }

      toast.error(`Đăng nhập thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập để truy cập hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            className='space-y-4'>
            <div className='space-y-2'>
              <label
                htmlFor='email'
                className='text-sm font-medium'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='password'
                className='text-sm font-medium'>
                Mật khẩu
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type='submit'
              className='w-full'
              disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-muted-foreground'>
            Tài khoản mặc định: admin@gmail.com / 123456
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
