'use client';

import { useState, useEffect } from 'react';
import
{
    Button, Table, Modal, Form, Input,
    Select, Space, Popconfirm, message,
    Typography, Tag, Tooltip, Avatar, Tabs
} from 'antd';
import
{
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, LockOutlined, MailOutlined,
    PhoneOutlined, IdcardOutlined, MedicineBoxOutlined,
    ExperimentOutlined, TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function UserManagement ()
{
    const [ users, setUsers ] = useState( [] );
    const [ roles, setRoles ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ modalVisible, setModalVisible ] = useState( false );
    const [ profileModalVisible, setProfileModalVisible ] = useState( false );
    const [ form ] = Form.useForm();
    const [ profileForm ] = Form.useForm();
    const [ editingId, setEditingId ] = useState( null );
    const [ currentUser, setCurrentUser ] = useState( null );
    const [ selectedDepartment, setSelectedDepartment ] = useState( "" );

    const departments = [
        { value: "NOI", label: "Nội" },
        { value: "NGOAI", label: "Ngoại" },
        { value: "SAN", label: "Sản" },
        { value: "NHI", label: "Nhi" },
        { value: "KHAC", label: "Khác" },
    ];
    const specialties = {
        NOI: [
            { value: "NOI_TIM_MACH", label: "Nội Tim Mạch" },
            { value: "NOI_TIEU_HOA", label: "Nội Tiêu Hóa" },
            { value: "NOI_HO_HAP", label: "Nội Hô Hấp" },
            { value: "NOI_THAN", label: "Nội Thận" },
            { value: "NOI_TIET", label: "Nội Tiết" },
            { value: "NOI_THAN_KINH", label: "Nội Thần Kinh" },
            { value: "NOI_DA_LIEU", label: "Nội Da Liễu" },
            { value: "NOI_TONG_QUAT", label: "Nội Tổng Quát" },
        ],
        NGOAI: [
            { value: "NGOAI_CHINH_HINH", label: "Ngoại Chỉnh Hình" },
            { value: "NGOAI_TIET_NIEU", label: "Ngoại Tiết Niệu" },
            { value: "NGOAI_THAN_KINH", label: "Ngoại Thần Kinh" },
            { value: "NGOAI_LONG_NGUC", label: "Ngoại Lồng Ngực" },
            { value: "NGOAI_TIEU_HOA", label: "Ngoại Tiêu Hóa" },
            { value: "NGOAI_TONG_QUAT", label: "Ngoại Tổng Quát" },
        ],
        SAN: [
            { value: "SAN_KHOA", label: "Sản Khoa" },
            { value: "PHU_KHOA", label: "Phụ Khoa" },
            { value: "VO_SINH", label: "Vô Sinh" },
        ],
        NHI: [
            { value: "NHI_TONG_QUAT", label: "Nhi Tổng Quát" },
            { value: "NHI_TIM_MACH", label: "Nhi Tim Mạch" },
            { value: "NHI_THAN_KINH", label: "Nhi Thần Kinh" },
            { value: "NHI_SO_SINH", label: "Nhi Sơ Sinh" },
        ],
        KHAC: [
            { value: "MAT", label: "Mắt" },
            { value: "TAI_MUI_HONG", label: "Tai Mũi Họng" },
            { value: "RANG_HAM_MAT", label: "Răng Hàm Mặt" },
            { value: "TAM_THAN", label: "Tâm Thần" },
            { value: "UNG_BUOU", label: "Ung Bướu" },
            { value: "DA_KHOA", label: "Đa Khoa" },
            { value: "KHAC", label: "Khác" },
        ],
    };

    useEffect( () =>
    {
        fetchUsers();
        fetchRoles();
    }, [] );

    useEffect( () =>
    {
        if ( profileModalVisible && currentUser && currentUser.profile && currentUser.profile.department )
        {
            setSelectedDepartment( currentUser.profile.department );
        } else if ( !profileModalVisible )
        {
            setSelectedDepartment( "" );
        }
    }, [ profileModalVisible, currentUser ] );

    const fetchUsers = async () =>
    {
        setLoading( true );
        try
        {
            const response = await axios.get( '/api/users' );
            setUsers( response.data );
        } catch ( error )
        {
            message.error( 'Không thể tải danh sách người dùng' );
            console.error( error );
        } finally
        {
            setLoading( false );
        }
    };

    const fetchRoles = async () =>
    {
        try
        {
            const response = await axios.get( '/api/roles' );
            setRoles( response.data );
        } catch ( error )
        {
            message.error( 'Không thể tải danh sách vai trò' );
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
            first_name: record.first_name,
            last_name: record.last_name,
            email: record.email,
            phone: record.phone || '',
            address: record.address || '',
            role: record.role,
            is_active: record.is_active ? 'true' : 'false',
        } );
        setModalVisible( true );
    };

    const handleEditProfile = ( record ) =>
    {
        setCurrentUser( record );

        // Thiết lập giá trị mặc định cho form dựa trên role
        const profileData = {
            phone: record.phone || '',
            address: record.address || '',
            ...record.profile
        };

        profileForm.setFieldsValue( profileData );
        setProfileModalVisible( true );
    };

    const handleDelete = async ( id ) =>
    {
        try
        {
            await axios.delete( `/api/users/${ id }` );
            message.success( 'Xóa người dùng thành công' );
            fetchUsers();
        } catch ( error )
        {
            message.error( 'Không thể xóa người dùng' );
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
                await axios.put( `/api/users/${ editingId }`, payload );
                message.success( 'Cập nhật người dùng thành công' );
            } else
            {
                await axios.post( '/api/users', payload );
                message.success( 'Thêm người dùng thành công' );
            }
            setModalVisible( false );
            fetchUsers();
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra' );
            console.error( error );
        }
    };

    const handleProfileSubmit = async ( values ) =>
    {
        try
        {
            if ( !currentUser ) return;

            const payload = {
                profile: values
            };

            await axios.put( `/api/users/${ currentUser.id }/profile`, payload );
            message.success( 'Cập nhật profile thành công' );
            setProfileModalVisible( false );
            fetchUsers();
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra khi cập nhật profile' );
            console.error( error );
        }
    };

    const getRoleColor = ( role ) =>
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
        return roleColors[ role ] || 'default';
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Họ tên',
            key: 'name',
            render: ( _, record ) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <span>{record.first_name} {record.last_name}</span>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: ( role ) => (
                <Tag color={getRoleColor( role )}>{role}</Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: ( isActive ) => (
                isActive ?
                    <Tag color="success">Hoạt động</Tag> :
                    <Tag color="error">Không hoạt động</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: ( _, record ) => (
                <Space>
                    <Tooltip title="Chỉnh sửa thông tin cơ bản">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit( record )}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa profile">
                        <Button
                            type="default"
                            icon={<IdcardOutlined />}
                            onClick={() => handleEditProfile( record )}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete( record.id )}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Render các trường form khác nhau tùy thuộc vào role
    const renderProfileFields = () =>
    {
        if ( !currentUser ) return null;

        const role = currentUser.role;

        switch ( role )
        {
            case 'DOCTOR':
                return (
                    <>
                        <Form.Item
                            name="department"
                            label="Khoa"
                            rules={[ { required: true, message: 'Vui lòng chọn khoa' } ]}
                        >
                            <Select
                                placeholder="Chọn khoa"
                                onChange={value =>
                                {
                                    setSelectedDepartment( value );
                                    profileForm.setFieldsValue( { specialization: undefined } );
                                }}
                                value={selectedDepartment || profileForm.getFieldValue( 'department' )}
                            >
                                {departments.map( dep => (
                                    <Option key={dep.value} value={dep.value}>{dep.label}</Option>
                                ) )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="specialization"
                            label="Chuyên khoa"
                            rules={[ { required: true, message: 'Vui lòng chọn chuyên khoa' } ]}
                        >
                            <Select
                                placeholder={selectedDepartment ? "Chọn chuyên khoa" : "Chọn khoa trước"}
                                disabled={!selectedDepartment}
                                value={profileForm.getFieldValue( 'specialization' )}
                            >
                                {selectedDepartment && specialties[ selectedDepartment ]?.map( spec => (
                                    <Option key={spec.value} value={spec.value}>{spec.label}</Option>
                                ) )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="qualification"
                            label="Bằng cấp"
                            rules={[ { required: true, message: 'Vui lòng nhập bằng cấp' } ]}
                        >
                            <Input placeholder="Nhập bằng cấp" />
                        </Form.Item>
                        <Form.Item
                            name="experience"
                            label="Kinh nghiệm (năm)"
                            rules={[ { required: true, message: 'Vui lòng nhập số năm kinh nghiệm' } ]}
                        >
                            <Input type="number" min={0} placeholder="Nhập số năm kinh nghiệm" />
                        </Form.Item>
                        <Form.Item
                            name="bio"
                            label="Tiểu sử"
                        >
                            <Input.TextArea rows={4} placeholder="Nhập tiểu sử" />
                        </Form.Item>
                    </>
                );
            case 'NURSE':
                return (
                    <>
                        <Form.Item
                            name="department"
                            label="Khoa/Phòng"
                            rules={[ { required: true, message: 'Vui lòng nhập khoa/phòng' } ]}
                        >
                            <Input placeholder="Nhập khoa/phòng" />
                        </Form.Item>
                        <Form.Item
                            name="qualification"
                            label="Bằng cấp"
                            rules={[ { required: true, message: 'Vui lòng nhập bằng cấp' } ]}
                        >
                            <Input placeholder="Nhập bằng cấp" />
                        </Form.Item>
                        <Form.Item
                            name="experience"
                            label="Kinh nghiệm (năm)"
                        >
                            <Input type="number" min={0} placeholder="Nhập số năm kinh nghiệm" />
                        </Form.Item>
                    </>
                );
            case 'PATIENT':
                return (
                    <>
                        <Form.Item
                            name="dob"
                            label="Ngày sinh"
                            rules={[ { required: true, message: 'Vui lòng nhập ngày sinh' } ]}
                        >
                            <Input type="date" />
                        </Form.Item>
                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[ { required: true, message: 'Vui lòng chọn giới tính' } ]}
                        >
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="blood_type"
                            label="Nhóm máu"
                        >
                            <Select placeholder="Chọn nhóm máu">
                                <Option value="A+">A+</Option>
                                <Option value="A-">A-</Option>
                                <Option value="B+">B+</Option>
                                <Option value="B-">B-</Option>
                                <Option value="AB+">AB+</Option>
                                <Option value="AB-">AB-</Option>
                                <Option value="O+">O+</Option>
                                <Option value="O-">O-</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="allergies"
                            label="Dị ứng"
                        >
                            <Input.TextArea rows={2} placeholder="Nhập thông tin dị ứng (nếu có)" />
                        </Form.Item>
                        <Form.Item
                            name="emergency_contact"
                            label="Liên hệ khẩn cấp"
                        >
                            <Input placeholder="Nhập thông tin liên hệ khẩn cấp" />
                        </Form.Item>
                    </>
                );
            case 'PHARMACIST':
                return (
                    <>
                        <Form.Item
                            name="license_number"
                            label="Số giấy phép hành nghề"
                            rules={[ { required: true, message: 'Vui lòng nhập số giấy phép' } ]}
                        >
                            <Input placeholder="Nhập số giấy phép hành nghề" />
                        </Form.Item>
                        <Form.Item
                            name="qualification"
                            label="Bằng cấp"
                            rules={[ { required: true, message: 'Vui lòng nhập bằng cấp' } ]}
                        >
                            <Input placeholder="Nhập bằng cấp" />
                        </Form.Item>
                        <Form.Item
                            name="experience"
                            label="Kinh nghiệm (năm)"
                        >
                            <Input type="number" min={0} placeholder="Nhập số năm kinh nghiệm" />
                        </Form.Item>
                    </>
                );
            case 'LAB_TECH':
                return (
                    <>
                        <Form.Item
                            name="specialization"
                            label="Chuyên môn"
                            rules={[ { required: true, message: 'Vui lòng nhập chuyên môn' } ]}
                        >
                            <Input prefix={<ExperimentOutlined />} placeholder="Nhập chuyên môn" />
                        </Form.Item>
                        <Form.Item
                            name="qualification"
                            label="Bằng cấp"
                            rules={[ { required: true, message: 'Vui lòng nhập bằng cấp' } ]}
                        >
                            <Input placeholder="Nhập bằng cấp" />
                        </Form.Item>
                        <Form.Item
                            name="lab_department"
                            label="Phòng xét nghiệm"
                            rules={[ { required: true, message: 'Vui lòng nhập phòng xét nghiệm' } ]}
                        >
                            <Input placeholder="Nhập phòng xét nghiệm" />
                        </Form.Item>
                    </>
                );
            case 'ADMIN':
                return (
                    <>
                        <Form.Item
                            name="department"
                            label="Phòng ban"
                            rules={[ { required: true, message: 'Vui lòng nhập phòng ban' } ]}
                        >
                            <Input prefix={<TeamOutlined />} placeholder="Nhập phòng ban" />
                        </Form.Item>
                        <Form.Item
                            name="position"
                            label="Chức vụ"
                            rules={[ { required: true, message: 'Vui lòng nhập chức vụ' } ]}
                        >
                            <Input placeholder="Nhập chức vụ" />
                        </Form.Item>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="user-management">
            <div className="header-section">
                <Title level={2}>Quản lý người dùng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Thêm người dùng mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal thêm/sửa người dùng cơ bản */}
            <Modal
                title={editingId ? "Cập nhật người dùng" : "Thêm người dùng mới"}
                open={modalVisible}
                onCancel={() => setModalVisible( false )}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="first_name"
                        label="Tên"
                        rules={[ { required: true, message: 'Vui lòng nhập tên' } ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
                    </Form.Item>
                    <Form.Item
                        name="last_name"
                        label="Họ"
                        rules={[ { required: true, message: 'Vui lòng nhập họ' } ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                    {!editingId && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[ { required: true, message: 'Vui lòng nhập mật khẩu' } ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[ { required: true, message: 'Vui lòng chọn vai trò' } ]}
                    >
                        <Select placeholder="Chọn vai trò">
                            {roles.map( role => (
                                <Option key={role.id} value={role.name}>
                                    {role.name}
                                </Option>
                            ) )}
                        </Select>
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

            {/* Modal chỉnh sửa profile theo role */}
            <Modal
                title={`Chỉnh sửa profile ${ currentUser?.role || '' }`}
                open={profileModalVisible}
                onCancel={() => setProfileModalVisible( false )}
                footer={null}
                width={700}
            >
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileSubmit}
                >
                    <Tabs defaultActiveKey="profile">
                        <TabPane tab="Thông tin cơ bản" key="basic">
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                            </Form.Item>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </TabPane>
                        <TabPane tab="Thông tin chuyên môn" key="profile">
                            {renderProfileFields()}
                        </TabPane>
                    </Tabs>
                    <Form.Item className="form-actions">
                        <Button type="default" onClick={() => setProfileModalVisible( false )}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
        .user-management {
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
