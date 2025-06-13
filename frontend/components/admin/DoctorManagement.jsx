'use client';

import { useState, useEffect } from 'react';
import
    {
        Button,
        Table,
        Modal,
        Form,
        Input,
        Select,
        InputNumber,
        Space,
        Popconfirm,
        message,
        Typography,
        Upload,
        Avatar,
    } from 'antd';
import
    {
        PlusOutlined,
        EditOutlined,
        DeleteOutlined,
        UserOutlined,
        UploadOutlined,
    } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function DoctorManagement ()
{
    const [ doctors, setDoctors ] = useState( [] );
    const [ departments, setDepartments ] = useState( [] );
    const [ users, setUsers ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ modalVisible, setModalVisible ] = useState( false );
    const [ form ] = Form.useForm();
    const [ editingId, setEditingId ] = useState( null );

    useEffect( () =>
    {
        fetchDoctors();
        fetchDepartments();
        fetchUsers();
    }, [] );

    const fetchDoctors = async () =>
    {
        setLoading( true );
        try
        {
            const response = await axios.get( '/api/doctors' );
            setDoctors( response.data );
        } catch ( error )
        {
            message.error( 'Không thể lấy danh sách bác sĩ' );
            console.error( error );
        } finally
        {
            setLoading( false );
        }
    };

    const fetchDepartments = async () =>
    {
        try
        {
            const response = await axios.get( '/api/departments' );
            setDepartments( response.data );
        } catch ( error )
        {
            message.error( 'Không thể lấy danh sách khoa' );
            console.error( error );
        }
    };

    const fetchUsers = async () =>
    {
        try
        {
            // Chỉ lấy người dùng có vai trò là DOCTOR hoặc chưa có profile bác sĩ
            const response = await axios.get( '/api/users?role=DOCTOR&no_doctor_profile=true' );
            setUsers( response.data );
        } catch ( error )
        {
            message.error( 'Không thể lấy danh sách người dùng' );
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
            user_id: record.user_id,
            department: record.department?.id,
            specialty: record.specialty,
            qualifications: record.qualifications,
            experience_years: record.experience_years,
            bio: record.bio,
            avatar: record.avatar,
            consultation_fee: record.consultation_fee,
            is_active: record.is_active ? 'true' : 'false',
        } );
        setModalVisible( true );
    };

    const handleDelete = async ( id ) =>
    {
        try
        {
            await axios.delete( `/api/doctors/${ id }` );
            message.success( 'Xóa bác sĩ thành công' );
            fetchDoctors();
        } catch ( error )
        {
            message.error( 'Không thể xóa bác sĩ' );
            console.error( error );
        }
    };

    const handleSubmit = async ( values ) =>
    {
        try
        {
            const payload = {
                ...values,
                is_active: values.is_active === 'true',
            };

            if ( editingId )
            {
                await axios.put( `/api/doctors/${ editingId }`, payload );
                message.success( 'Cập nhật bác sĩ thành công' );
            } else
            {
                await axios.post( '/api/doctors', payload );
                message.success( 'Thêm bác sĩ thành công' );
            }
            setModalVisible( false );
            fetchDoctors();
            fetchUsers(); // Cập nhật danh sách users
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra' );
            console.error( error );
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'user_id',
            key: 'user_id',
            width: 80,
        },
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: ( avatar ) => (
                <Avatar
                    size={40}
                    src={avatar}
                    icon={<UserOutlined />}
                />
            ),
        },
        {
            title: 'Chuyên khoa',
            dataIndex: 'specialty',
            key: 'specialty',
        },
        {
            title: 'Khoa',
            dataIndex: 'department_name',
            key: 'department_name',
        },
        {
            title: 'Kinh nghiệm',
            dataIndex: 'experience_years',
            key: 'experience_years',
            render: ( years ) => `${ years } năm`,
        },
        {
            title: 'Phí tư vấn',
            dataIndex: 'consultation_fee',
            key: 'consultation_fee',
            render: ( fee ) => `${ fee.toLocaleString() } VNĐ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: ( isActive ) => ( isActive ? 'Hoạt động' : 'Không hoạt động' ),
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
        <div className="doctor-management">
            <div className="header-section">
                <Title level={2}>Quản lý bác sĩ</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Thêm bác sĩ mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={doctors}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                expandable={{
                    expandedRowRender: ( record ) => (
                        <div className="expanded-row">
                            <p><strong>Trình độ:</strong> {record.qualifications}</p>
                            <p><strong>Tiểu sử:</strong> {record.bio}</p>
                        </div>
                    ),
                }}
            />

            <Modal
                title={editingId ? "Cập nhật thông tin bác sĩ" : "Thêm bác sĩ mới"}
                open={modalVisible}
                onCancel={() => setModalVisible( false )}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="user_id"
                        label="Người dùng"
                        rules={[ { required: true, message: 'Vui lòng chọn người dùng' } ]}
                    >
                        <Select
                            placeholder="Chọn người dùng"
                            disabled={!!editingId}
                        >
                            {users.map( user => (
                                <Option key={user.id} value={user.id}>
                                    {user.email} - {user.first_name} {user.last_name}
                                </Option>
                            ) )}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="department"
                        label="Khoa"
                        rules={[ { required: true, message: 'Vui lòng chọn khoa' } ]}
                    >
                        <Select placeholder="Chọn khoa">
                            {departments.map( dept => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ) )}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="specialty"
                        label="Chuyên khoa"
                        rules={[ { required: true, message: 'Vui lòng nhập chuyên khoa' } ]}
                    >
                        <Input placeholder="Nhập chuyên khoa" />
                    </Form.Item>
                    <Form.Item
                        name="qualifications"
                        label="Trình độ"
                        rules={[ { required: true, message: 'Vui lòng nhập trình độ' } ]}
                    >
                        <TextArea rows={4} placeholder="Nhập trình độ chuyên môn, bằng cấp" />
                    </Form.Item>
                    <Form.Item
                        name="experience_years"
                        label="Số năm kinh nghiệm"
                        rules={[ { required: true, message: 'Vui lòng nhập số năm kinh nghiệm' } ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Nhập số năm kinh nghiệm"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="bio"
                        label="Tiểu sử"
                    >
                        <TextArea rows={4} placeholder="Nhập tiểu sử" />
                    </Form.Item>
                    <Form.Item
                        name="avatar"
                        label="URL ảnh đại diện"
                    >
                        <Input placeholder="Nhập URL ảnh đại diện" />
                    </Form.Item>
                    <Form.Item
                        name="consultation_fee"
                        label="Phí tư vấn (VNĐ)"
                        rules={[ { required: true, message: 'Vui lòng nhập phí tư vấn' } ]}
                    >
                        <InputNumber
                            min={0}
                            formatter={( value ) => `${ value }`.replace( /\B(?=(\d{3})+(?!\d))/g, ',' )}
                            parser={( value ) => value.replace( /\$\s?|(,*)/g, '' )}
                            style={{ width: '100%' }}
                            placeholder="Nhập phí tư vấn"
                        />
                    </Form.Item>
                    <Form.Item
                        name="is_active"
                        label="Trạng thái"
                        initialValue="true"
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value="true">Hoạt động</Option>
                            <Option value="false">Không hoạt động</Option>
                        </Select>
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
        .doctor-management {
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          align-items: center;
        }
        .expanded-row {
          padding: 10px 20px;
          background-color: #f7f7f7;
        }
        :global(.form-actions) {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
        </div>
    );
} 