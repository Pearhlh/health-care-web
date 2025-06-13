'use client';

import { Suspense } from 'react';
import DoctorManagement from '../../../../components/admin/DoctorManagement';
import { Card, Skeleton } from 'antd';

export default function DoctorsPage ()
{
    return (
        <div className="doctors-page">
            <Suspense fallback={<Card><Skeleton active /></Card>}>
                <DoctorManagement />
            </Suspense>

            <style jsx>{`
        .doctors-page {
          padding: 16px;
        }
      `}</style>
        </div>
    );
} 