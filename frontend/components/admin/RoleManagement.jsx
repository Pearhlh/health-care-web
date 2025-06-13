'use client';

import React from 'react';
import { Table, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function RoleManagement ()
{
  const roles = [
    {
      id: 1,
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống',
      permissions: [
        { id: 1, name: 'Quản lý người dùng' },
        { id: 2, name: 'Quản lý vai trò' },
      ]
    },
    {
      id: 2,
      name: 'DOCTOR',
      description: 'Bác sĩ',
      permissions: [
        { id: 3, name: 'Quản lý bệnh nhân' },
        { id: 4, name: 'Kê đơn thuốc' },
      ]
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div className="role-management">
      <div className="header-section">
        <h2>Quản lý vai trò</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
        >
          Thêm vai trò mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
      />

      <style jsx>{`
        .role-management {
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
