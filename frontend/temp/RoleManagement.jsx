'use client';

import { useState, useEffect } from 'react';
import
{
    Button, Table, Modal, Form, Input,
    Space, Popconfirm, message, Typography,
    Tag, Tooltip, Checkbox, Card, Divider
} from 'antd';
import
{
    PlusOutlined, EditOutlined, DeleteOutlined,
    LockOutlined, TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function RoleManagement ()
{
    const [ roles, setRoles ] = useState( [] );
    const [ permissions, setPermissions ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ modalVisible, setModalVisible ] = useState( false );
    const [ form ] = Form.useForm();
    const [ editingId, setEditingId ] = useState( null );

    const permissionGroups = {
        'user': 'Người dùng',
        'appointment': 'Lịch hẹn',
        'medical_record': 'Hồ sơ y tế',
        'billing': 'Thanh toán',
        'pharmacy': 'Dược phẩm',
        'laboratory': 'Xét nghiệm',
        'system': 'Hệ thống'
    };

    useEffect( () =>
    {
        fetchRoles();
        fetchPermissions();
    }, [] );

    const fetchRoles = async () =>
    {
        setLoading( true );
        try
        {
            const response = await axios.get( '/api/roles' );
            setRoles( response.data );
        } catch ( error )
        {
            message.error( 'Không thể tải danh sách vai trò' );
            console.error( error );
        } finally
        {
            setLoading( false );
        }
    };

    const fetchPermissions = async () =>
    {
        try
        {
            const response = await axios.get( '/api/permissions' );
            setPermissions( response.data );
        } catch ( error )
        {
            message.error( 'Không thể tải danh sách quyền hạn' );
            console.error( error );
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
            permissions: record.permissions.map( p => p.id )
        } );
        setModalVisible( true );
    };

    const handleDelete = async ( id ) =>
    {
        try
        {
            await axios.delete( `/api/roles/${ id }` );
            message.success( 'Xóa vai trò thành công' );
            fetchRoles();
        } catch ( error )
        {
            message.error( 'Không thể xóa vai trò' );
            console.error( error );
        }
    };

    const handleSubmit = async ( values ) =>
    {
        try
        {
            if ( editingId )
            {
                await axios.put( `/api/roles/${ editingId }`, values );
                message.success( 'Cập nhật vai trò thành công' );
            } else
            {
                await axios.post( '/api/roles', values );
                message.success( 'Thêm vai trò thành công' );
            }
            setModalVisible( false );
            fetchRoles();
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra' );
            console.error( error );
        }
    };

    const getRoleColor = ( name ) =>
    {
        const roleColors = {
            ADMIN: 'red',
            DOCTOR: 'blue',
            PATIENT: 'green',
            NURSE: 'purple',
            LAB_TECH: 'orange',
            PHARMACIST: 'cyan',
            RECEPTIONIST: 'magenta',
        };
        return roleColors[ name ] || 'default';
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
            key: 'name',
            render: ( name ) => (
                <Tag color={getRoleColor( name )} style={{ fontSize: '14px', padding: '2px 8px' }}>
                    {name}
                </Tag>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Số quyền',
            key: 'permissionsCount',
            render: ( _, record ) => (
                <Text>{record.permissions?.length || 0}</Text>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: ( _, record ) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit( record )}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete( record.id )}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            disabled={record.name === 'ADMIN'}
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={record.name === 'ADMIN'}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const groupedPermissions = {};
    permissions.forEach( permission =>
    {
        const group = permission.codename?.split( '_' )[ 0 ] || 'other';
        if ( !groupedPermissions[ group ] )
        {
            groupedPermissions[ group ] = [];
        }
        groupedPermissions[ group ].push( permission );
    } );

    return (
        <div className="role-management">
            <div className="header-section">
                <Title level={2}>Quản lý vai trò</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Thêm vai trò mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={roles}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                expandable={{
                    expandedRowRender: ( record ) => (
                        <div className="permissions-list">
                            <Text strong>Danh sách quyền:</Text>
                            <div style={{ marginTop: 8 }}>
                                {record.permissions?.length > 0 ? (
                                    <Space wrap>
                                        {record.permissions.map( permission => (
                                            <Tag key={permission.id}>{permission.name}</Tag>
                                        ) )}
                                    </Space>
                                ) : (
                                    <Text type="secondary">Không có quyền nào</Text>
                                )}
                            </div>
                        </div>
                    ),
                }}
            />

            <Modal
                title={editingId ? "Cập nhật vai trò" : "Thêm vai trò mới"}
                open={modalVisible}
                onCancel={() => setModalVisible( false )}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên vai trò"
                        rules={[ { required: true, message: 'Vui lòng nhập tên vai trò' } ]}
                    >
                        <Input prefix={<TeamOutlined />} placeholder="Nhập tên vai trò" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Mô tả về vai trò này" />
                    </Form.Item>

                    <Divider orientation="left">Phân quyền</Divider>

                    <Form.Item
                        name="permissions"
                        label="Quyền hạn"
                    >
                        <div className="permissions-container">
                            {Object.keys( groupedPermissions ).map( group => (
                                <Card
                                    key={group}
                                    title={permissionGroups[ group ] || group}
                                    size="small"
                                    className="permission-group"
                                >
                                    <Checkbox.Group className="checkbox-group">
                                        {groupedPermissions[ group ].map( permission => (
                                            <Checkbox key={permission.id} value={permission.id}>
                                                {permission.name}
                                            </Checkbox>
                                        ) )}
                                    </Checkbox.Group>
                                </Card>
                            ) )}
                        </div>
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

            <style jsx global>{`
        .role-management {
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: center;
        }
        .permissions-container {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
        }
        .permission-group {
          width: calc(50% - 8px);
          margin-bottom: 8px;
        }
        .checkbox-group {
          display: flex;
          flex-direction: column;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
        </div>
    );
} 