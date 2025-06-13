'use client';

import { Suspense } from 'react';
import DepartmentManagement from '../../../../components/admin/DepartmentManagement';
import { Card, Skeleton } from 'antd';

export default function DepartmentsPage ()
{
    return (
        <div className="departments-page">
            <Suspense fallback={<Card><Skeleton active /></Card>}>
                <DepartmentManagement />
            </Suspense>

            <style jsx>{`
        .departments-page {
          padding: 16px;
        }
      `}</style>
        </div>
    );
} 