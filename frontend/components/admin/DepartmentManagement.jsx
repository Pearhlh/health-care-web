'use client';

import { useState, useEffect } from 'react';
import
    {
        Button, Table, Modal, Form, Input,
        Space, Popconfirm, message, Typography
    } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;

export default function DepartmentManagement ()
{
    const [ departments, setDepartments ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ modalVisible, setModalVisible ] = useState( false );
    const [ form ] = Form.useForm();
    const [ editingId, setEditingId ] = useState( null );

    useEffect( () =>
    {
        fetchDepartments();
    }, [] );

    const fetchDepartments = async () =>
    {
        setLoading( true );
        try
        {
            const response = await axios.get( '/api/departments' );
            setDepartments( response.data );
        } catch ( error )
        {
            message.error( 'Không thể lấy danh sách khoa' );
            console.error( error );
        } finally
        {
            setLoading( false );
        }
    };

    const handleCreate = () =>
    {
        setEditingId( null );
        form.resetFields();
        setModalVisible( true );
    };

    const handleEdit = ( record ) =>
    {
        setEditingId( record.id );
        form.setFieldsValue( {
            name: record.name,
            description: record.description,
            image: record.image,
        } );
        setModalVisible( true );
    };

    const handleDelete = async ( id ) =>
    {
        try
        {
            await axios.delete( `/api/departments/${ id }` );
            message.success( 'Xóa khoa thành công' );
            fetchDepartments();
        } catch ( error )
        {
            message.error( 'Không thể xóa khoa' );
            console.error( error );
        }
    };

    const handleSubmit = async ( values ) =>
    {
        try
        {
            if ( editingId )
            {
                await axios.put( `/api/departments/${ editingId }`, values );
                message.success( 'Cập nhật khoa thành công' );
            } else
            {
                await axios.post( '/api/departments', values );
                message.success( 'Thêm khoa thành công' );
            }
            setModalVisible( false );
            fetchDepartments();
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra' );
            console.error( error );
        }
    };

    const columns = [
        {
            title: 'Tên khoa',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: ( isActive ) => (
                isActive ? 'Hoạt động' : 'Không hoạt động'
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: ( _, record ) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit( record )}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete( record.id )}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="department-management">
            <div className="header-section">
                <Title level={2}>Quản lý khoa</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Thêm khoa mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingId ? "Cập nhật khoa" : "Thêm khoa mới"}
                open={modalVisible}
                onCancel={() => setModalVisible( false )}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên khoa"
                        rules={[ { required: true, message: 'Vui lòng nhập tên khoa' } ]}
                    >
                        <Input placeholder="Nhập tên khoa" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả về khoa" />
                    </Form.Item>
                    <Form.Item
                        name="image"
                        label="URL hình ảnh"
                    >
                        <Input placeholder="Nhập URL hình ảnh" />
                    </Form.Item>
                    <Form.Item className="form-actions">
                        <Button type="default" onClick={() => setModalVisible( false )}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                            {editingId ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
        .department-management {
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: center;
        }
        :global(.form-actions) {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
        </div>
    );
} 