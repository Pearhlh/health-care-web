"use client";

import { PageHeader } from "../../../../../components/page-header";
import { SimpleBookingForm } from "./components/SimpleBookingForm";

export default function SimpleBookingPage() {
  return (
    <div className='container mx-auto'>
      <PageHeader
        title='Đặt lịch hẹn đơn giản'
        description='Đặt lịch hẹn khám bệnh chỉ với vài bước đơn giản'
      />
      <SimpleBookingForm />
    </div>
  );
}
