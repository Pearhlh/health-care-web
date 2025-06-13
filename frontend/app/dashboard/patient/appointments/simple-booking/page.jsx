'use client';

import { Suspense } from 'react';
import AppointmentBooking from '../../../../../components/patient/AppointmentBooking';
import { Card, Skeleton } from 'antd';

export default function BookingPage ()
{
    return (
        <div className="booking-page">
            <Suspense fallback={<Card><Skeleton active /></Card>}>
                <AppointmentBooking />
            </Suspense>

            <style jsx>{`
        .booking-page {
          padding: 16px;
        }
      `}</style>
        </div>
    );
} 