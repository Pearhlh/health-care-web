'use client';

import { useState, useEffect } from 'react';
import
    {
        Steps,
        Card,
        Select,
        Button,
        Typography,
        Row,
        Col,
        List,
        Avatar,
        Radio,
        Form,
        Input,
        DatePicker,
        Alert,
        Modal,
        Result,
        Spin,
        Empty,
        Space,
    } from 'antd';
import { UserOutlined, CalendarOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale( 'vi' );

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function AppointmentBooking ()
{
    const [ currentStep, setCurrentStep ] = useState( 0 );
    const [ departments, setDepartments ] = useState( [] );
    const [ doctors, setDoctors ] = useState( [] );
    const [ selectedDepartment, setSelectedDepartment ] = useState( null );
    const [ selectedDoctor, setSelectedDoctor ] = useState( null );
    const [ selectedDate, setSelectedDate ] = useState( null );
    const [ availableSlots, setAvailableSlots ] = useState( [] );
    const [ selectedSlot, setSelectedSlot ] = useState( null );
    const [ reason, setReason ] = useState( '' );
    const [ loading, setLoading ] = useState( {
        departments: false,
        doctors: false,
        slots: false,
        booking: false,
    } );
    const [ bookingSuccess, setBookingSuccess ] = useState( false );
    const [ bookingData, setBookingData ] = useState( null );
    const [ error, setError ] = useState( null );

    useEffect( () =>
    {
        fetchDepartments();
    }, [] );

    const fetchDepartments = async () =>
    {
        setLoading( { ...loading, departments: true } );
        try
        {
            const response = await axios.get( '/api/departments' );
            setDepartments( response.data );
        } catch ( err )
        {
            setError( 'Không thể tải danh sách khoa. Vui lòng thử lại sau.' );
            console.error( err );
        } finally
        {
            setLoading( { ...loading, departments: false } );
        }
    };

    const fetchDoctors = async ( departmentId ) =>
    {
        setLoading( { ...loading, doctors: true } );
        setDoctors( [] );
        setSelectedDoctor( null );
        setAvailableSlots( [] );
        setSelectedSlot( null );

        try
        {
            const response = await axios.get( `/api/doctors?department_id=${ departmentId }` );
            setDoctors( response.data );
        } catch ( err )
        {
            setError( 'Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.' );
            console.error( err );
        } finally
        {
            setLoading( { ...loading, doctors: false } );
        }
    };

    const fetchAvailableSlots = async ( doctorId, date ) =>
    {
        setLoading( { ...loading, slots: true } );
        setAvailableSlots( [] );
        setSelectedSlot( null );

        try
        {
            const formattedDate = date.format( 'YYYY-MM-DD' );
            const response = await axios.get(
                `/api/doctors/${ doctorId }/availabilities?start_date=${ formattedDate }&end_date=${ formattedDate }`
            );
            const availableSlots = response.data.filter( slot => slot.is_available );
            setAvailableSlots( availableSlots );
        } catch ( err )
        {
            setError( 'Không thể tải danh sách lịch trống. Vui lòng thử lại sau.' );
            console.error( err );
        } finally
        {
            setLoading( { ...loading, slots: false } );
        }
    };

    const handleBookAppointment = async () =>
    {
        if ( !selectedDoctor || !selectedSlot || !reason )
        {
            setError( 'Vui lòng hoàn tất tất cả các thông tin để đặt lịch.' );
            return;
        }

        setLoading( { ...loading, booking: true } );
        try
        {
            const response = await axios.post( '/api/appointments', {
                doctor_id: selectedDoctor.id,
                availability_id: selectedSlot.id,
                patient_id: 1, // Sẽ lấy từ thông tin đăng nhập thực tế
                reason: reason,
            } );

            setBookingData( response.data );
            setBookingSuccess( true );
            setCurrentStep( 3 );
        } catch ( err )
        {
            setError( 'Đặt lịch không thành công. Vui lòng thử lại sau.' );
            console.error( err );
        } finally
        {
            setLoading( { ...loading, booking: false } );
        }
    };

    const handleDepartmentChange = ( departmentId ) =>
    {
        setSelectedDepartment( departmentId );
        fetchDoctors( departmentId );
        setCurrentStep( 1 );
    };

    const handleDoctorSelect = ( doctor ) =>
    {
        setSelectedDoctor( doctor );
        setSelectedDate( null );
        setAvailableSlots( [] );
        setCurrentStep( 2 );
    };

    const handleDateChange = ( date ) =>
    {
        setSelectedDate( date );
        if ( selectedDoctor )
        {
            fetchAvailableSlots( selectedDoctor.id, date );
        }
    };

    const steps = [
        {
            title: 'Chọn khoa',
            icon: <UserOutlined />,
            content: (
                <div className="step-content">
                    <Title level={4}>Chọn khoa phù hợp với nhu cầu khám bệnh của bạn</Title>
                    <Paragraph>Mỗi khoa có các bác sĩ chuyên môn riêng để phục vụ nhu cầu khám chữa bệnh</Paragraph>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError( null )}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {loading.departments ? (
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[ 16, 16 ]}>
                            {departments.map( ( department ) => (
                                <Col xs={24} sm={12} md={8} lg={8} key={department.id}>
                                    <Card
                                        hoverable
                                        className={`department-card ${ selectedDepartment === department.id ? 'selected' : '' }`}
                                        onClick={() => handleDepartmentChange( department.id )}
                                    >
                                        <div className="department-info">
                                            <img
                                                src={department.image || 'https://via.placeholder.com/80'}
                                                alt={department.name}
                                                className="department-image"
                                            />
                                            <div>
                                                <Title level={5}>{department.name}</Title>
                                                <Text type="secondary">{department.description}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ) )}
                        </Row>
                    )}
                </div>
            ),
        },
        {
            title: 'Chọn bác sĩ',
            icon: <UserOutlined />,
            content: (
                <div className="step-content">
                    <Title level={4}>Chọn bác sĩ phù hợp với bạn</Title>
                    <Paragraph>Tất cả các bác sĩ đều có kinh nghiệm và trình độ chuyên môn cao</Paragraph>

                    <Button
                        type="link"
                        onClick={() =>
                        {
                            setCurrentStep( 0 );
                            setSelectedDoctor( null );
                        }}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        &lt; Quay lại chọn khoa
                    </Button>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError( null )}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {loading.doctors ? (
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    ) : (
                        doctors.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={doctors}
                                renderItem={( doctor ) => (
                                    <List.Item
                                        key={doctor.id}
                                        onClick={() => handleDoctorSelect( doctor )}
                                        className={`doctor-item ${ selectedDoctor?.id === doctor.id ? 'selected' : '' }`}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size={64}
                                                    src={doctor.avatar || 'https://via.placeholder.com/64'}
                                                    icon={<UserOutlined />}
                                                />
                                            }
                                            title={<span>Bác sĩ {doctor.user_id}</span>}
                                            description={
                                                <div>
                                                    <div>Chuyên khoa: {doctor.specialty}</div>
                                                    <div>Kinh nghiệm: {doctor.experience_years} năm</div>
                                                    <div>Phí tư vấn: {doctor.consultation_fee.toLocaleString()} VNĐ</div>
                                                </div>
                                            }
                                        />
                                        <div>
                                            <Button type="primary">Chọn</Button>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có bác sĩ nào trong khoa này" />
                        )
                    )}
                </div>
            ),
        },
        {
            title: 'Chọn lịch hẹn',
            icon: <CalendarOutlined />,
            content: (
                <div className="step-content">
                    <Title level={4}>Chọn ngày và giờ cho cuộc hẹn</Title>

                    <Space direction="horizontal" style={{ marginBottom: 16 }}>
                        <Button
                            type="link"
                            onClick={() =>
                            {
                                setCurrentStep( 1 );
                                setSelectedDate( null );
                                setAvailableSlots( [] );
                                setSelectedSlot( null );
                            }}
                            style={{ padding: 0 }}
                        >
                            &lt; Quay lại chọn bác sĩ
                        </Button>
                    </Space>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError( null )}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Card title="Thông tin bác sĩ" className="info-card">
                                <div className="doctor-info">
                                    <Avatar
                                        size={64}
                                        src={selectedDoctor?.avatar || 'https://via.placeholder.com/64'}
                                        icon={<UserOutlined />}
                                    />
                                    <div className="doctor-details">
                                        <Title level={5}>Bác sĩ {selectedDoctor?.user_id}</Title>
                                        <Text>Chuyên khoa: {selectedDoctor?.specialty}</Text>
                                        <Text>Kinh nghiệm: {selectedDoctor?.experience_years} năm</Text>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Chọn ngày khám" className="info-card" style={{ marginTop: 16 }}>
                                <DatePicker
                                    style={{ width: '100%' }}
                                    onChange={handleDateChange}
                                    format="DD/MM/YYYY"
                                    disabledDate={( current ) =>
                                    {
                                        return current && current < dayjs().startOf( 'day' );
                                    }}
                                    placeholder="Chọn ngày khám"
                                />
                            </Card>

                            <Card title="Lý do khám" className="info-card" style={{ marginTop: 16 }}>
                                <Form.Item>
                                    <TextArea
                                        rows={4}
                                        placeholder="Nhập triệu chứng hoặc lý do bạn muốn khám bệnh"
                                        value={reason}
                                        onChange={( e ) => setReason( e.target.value )}
                                    />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card title="Chọn giờ khám" className="info-card">
                                {selectedDate ? (
                                    loading.slots ? (
                                        <div className="loading-container">
                                            <Spin size="large" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <Radio.Group
                                            value={selectedSlot?.id}
                                            onChange={( e ) =>
                                            {
                                                const slot = availableSlots.find( s => s.id === e.target.value );
                                                setSelectedSlot( slot );
                                            }}
                                            className="time-slot-container"
                                        >
                                            {availableSlots.map( slot => (
                                                <Radio.Button
                                                    key={slot.id}
                                                    value={slot.id}
                                                    className="time-slot"
                                                >
                                                    {dayjs( `2000-01-01 ${ slot.start_time }` ).format( 'HH:mm' )} -
                                                    {dayjs( `2000-01-01 ${ slot.end_time }` ).format( 'HH:mm' )}
                                                </Radio.Button>
                                            ) )}
                                        </Radio.Group>
                                    ) : (
                                        <Empty description="Không có lịch trống cho ngày này" />
                                    )
                                ) : (
                                    <Empty description="Vui lòng chọn ngày trước" />
                                )}
                            </Card>

                            <Card title="Xác nhận đặt lịch" className="info-card" style={{ marginTop: 16 }}>
                                <div className="appointment-summary">
                                    <div className="summary-item">
                                        <Text strong>Ngày khám:</Text>
                                        <Text>{selectedDate ? selectedDate.format( 'DD/MM/YYYY' ) : 'Chưa chọn'}</Text>
                                    </div>
                                    <div className="summary-item">
                                        <Text strong>Giờ khám:</Text>
                                        <Text>
                                            {selectedSlot
                                                ? `${ dayjs( `2000-01-01 ${ selectedSlot.start_time }` ).format( 'HH:mm' ) } - ${ dayjs( `2000-01-01 ${ selectedSlot.end_time }` ).format( 'HH:mm' ) }`
                                                : 'Chưa chọn'}
                                        </Text>
                                    </div>
                                    <div className="summary-item">
                                        <Text strong>Phí tư vấn:</Text>
                                        <Text>{selectedDoctor ? `${ selectedDoctor.consultation_fee.toLocaleString() } VNĐ` : 'Chưa có'}</Text>
                                    </div>
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    onClick={handleBookAppointment}
                                    disabled={!selectedSlot || !reason || loading.booking}
                                    loading={loading.booking}
                                >
                                    Xác nhận đặt lịch
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            title: 'Hoàn tất',
            icon: <CheckOutlined />,
            content: (
                <div className="step-content">
                    <Result
                        status="success"
                        title="Đặt lịch thành công!"
                        subTitle={
                            <>
                                <p>Mã cuộc hẹn: {bookingData?.id}</p>
                                <p>
                                    Ngày khám: {bookingData
                                        ? dayjs( bookingData.appointment_date ).format( 'DD/MM/YYYY' )
                                        : ''}
                                </p>
                                <p>
                                    Giờ khám: {bookingData
                                        ? `${ dayjs( `2000-01-01 ${ bookingData.start_time }` ).format( 'HH:mm' ) } - ${ dayjs( `2000-01-01 ${ bookingData.end_time }` ).format( 'HH:mm' ) }`
                                        : ''}
                                </p>
                            </>
                        }
                        extra={[
                            <Button type="primary" key="dashboard" onClick={() => window.location.href = '/dashboard/patient/appointments'}>
                                Xem lịch hẹn của tôi
                            </Button>,
                            <Button key="new" onClick={() =>
                            {
                                setCurrentStep( 0 );
                                setSelectedDepartment( null );
                                setSelectedDoctor( null );
                                setSelectedDate( null );
                                setSelectedSlot( null );
                                setReason( '' );
                                setAvailableSlots( [] );
                                setBookingSuccess( false );
                                setBookingData( null );
                            }}>
                                Đặt lịch mới
                            </Button>,
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="appointment-booking">
            <Card className="booking-card">
                <Title level={2}>Đặt lịch khám bệnh</Title>

                <Steps
                    current={currentStep}
                    items={steps.map( ( item ) => ( {
                        title: item.title,
                        icon: item.icon,
                    } ) )}
                    className="booking-steps"
                />

                <div className="steps-content">
                    {steps[ currentStep ].content}
                </div>

                <style jsx global>{`
          .appointment-booking {
            padding: 20px;
          }
          .booking-card {
            margin-bottom: 24px;
          }
          .booking-steps {
            margin: 24px 0;
          }
          .step-content {
            margin-top: 16px;
            padding: 16px 0;
          }
          .department-card {
            transition: all 0.3s;
            cursor: pointer;
            height: 100%;
          }
          .department-card.selected {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
          .department-info {
            display: flex;
            align-items: center;
          }
          .department-image {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            object-fit: cover;
            margin-right: 16px;
          }
          .doctor-item {
            padding: 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .doctor-item.selected {
            background-color: #f0f5ff;
            border-left: 4px solid #1890ff;
          }
          .doctor-item:hover {
            background-color: #f5f5f5;
          }
          .info-card {
            margin-bottom: 16px;
          }
          .doctor-info {
            display: flex;
            align-items: flex-start;
          }
          .doctor-details {
            margin-left: 16px;
          }
          .time-slot-container {
            display: flex;
            flex-wrap: wrap;
          }
          .time-slot {
            margin: 8px;
            padding: 8px 16px;
          }
          .appointment-summary {
            margin-bottom: 16px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 48px;
          }
        `}</style>
            </Card>
        </div>
    );
} 