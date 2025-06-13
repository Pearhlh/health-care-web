'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

// Import động để tránh lỗi server-side rendering với antd
const RoleManagement = dynamic(
  () => import( '../../../../components/admin/RoleManagement' ),
  {
    ssr: false,
    loading: () => <Card><Skeleton active /></Card>
  }
);

export default function RolesPage ()
{
  return (
    <div className="roles-page">
      <RoleManagement />

      <style jsx>{`
        .roles-page {
          padding: 16px;
        }
      `}</style>
    </div>
  );
} 