'use client';

import { useState, useEffect } from 'react';
import
    {
        Button,
        Table,
        Modal,
        Form,
        DatePicker,
        TimePicker,
        Space,
        Popconfirm,
        message,
        Typography,
        Card,
        Calendar,
        Badge,
        InputNumber,
        Select,
        Row,
        Col,
    } from 'antd';
import
    {
        PlusOutlined,
        DeleteOutlined,
        ScheduleOutlined,
    } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend( localizedFormat );
dayjs.locale( 'vi' );

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

export default function AvailabilityManagement ( { doctorId } )
{
    const [ availabilities, setAvailabilities ] = useState( [] );
    const [ loading, setLoading ] = useState( false );
    const [ modalVisible, setModalVisible ] = useState( false );
    const [ calendarView, setCalendarView ] = useState( true );
    const [ form ] = Form.useForm();

    useEffect( () =>
    {
        fetchAvailabilities();
    }, [] );

    const fetchAvailabilities = async () =>
    {
        setLoading( true );
        try
        {
            const response = await axios.get( `/api/doctors/${ doctorId }/availabilities` );
            setAvailabilities( response.data );
        } catch ( error )
        {
            message.error( 'Không thể lấy danh sách lịch trống' );
            console.error( error );
        } finally
        {
            setLoading( false );
        }
    };

    const handleCreate = () =>
    {
        form.resetFields();
        setModalVisible( true );
    };

    const handleDelete = async ( id ) =>
    {
        try
        {
            await axios.delete( `/api/doctor-availabilities/${ id }` );
            message.success( 'Xóa lịch trống thành công' );
            fetchAvailabilities();
        } catch ( error )
        {
            message.error( 'Không thể xóa lịch trống' );
            console.error( error );
        }
    };

    const handleSubmit = async ( values ) =>
    {
        try
        {
            const timeRange = values.timeRange;
            const payload = {
                doctor: doctorId,
                date: values.date.format( 'YYYY-MM-DD' ),
                start_time: timeRange[ 0 ].format( 'HH:mm:ss' ),
                end_time: timeRange[ 1 ].format( 'HH:mm:ss' ),
                repeat_count: values.repeat_count,
                interval_minutes: values.interval_minutes,
            };

            await axios.post( '/api/doctor-availabilities', payload );
            message.success( 'Thêm lịch trống thành công' );

            setModalVisible( false );
            fetchAvailabilities();
        } catch ( error )
        {
            message.error( 'Có lỗi xảy ra khi thêm lịch trống' );
            console.error( error );
        }
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: ( date ) => dayjs( date ).format( 'DD/MM/YYYY' ),
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'start_time',
            key: 'start_time',
            render: ( time ) => dayjs( `2000-01-01 ${ time }` ).format( 'HH:mm' ),
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'end_time',
            key: 'end_time',
            render: ( time ) => dayjs( `2000-01-01 ${ time }` ).format( 'HH:mm' ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_available',
            key: 'is_available',
            render: ( isAvailable ) => (
                isAvailable ?
                    <Badge status="success" text="Còn trống" /> :
                    <Badge status="error" text="Đã đặt" />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: ( _, record ) => (
                record.is_available && (
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
                )
            ),
        },
    ];

    // Tạo dữ liệu cho Calendar
    const getCalendarData = ( value ) =>
    {
        const date = value.format( 'YYYY-MM-DD' );
        const dayData = availabilities.filter( item => item.date === date );

        return dayData.map( item => ( {
            type: item.is_available ? 'success' : 'error',
            content: `${ dayjs( `2000-01-01 ${ item.start_time }` ).format( 'HH:mm' ) } - ${ dayjs( `2000-01-01 ${ item.end_time }` ).format( 'HH:mm' ) }`,
        } ) );
    };

    const dateCellRender = ( value ) =>
    {
        const listData = getCalendarData( value );
        return (
            <ul className="events">
                {listData.map( ( item, index ) => (
                    <li key={index}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ) )}
            </ul>
        );
    };

    return (
        <div className="availability-management">
            <Card className="card-container">
                <div className="header-section">
                    <Space align="center">
                        <Title level={3}>Quản lý lịch trống</Title>
                        <Button
                            onClick={() => setCalendarView( !calendarView )}
                            icon={<ScheduleOutlined />}
                        >
                            {calendarView ? 'Xem dạng bảng' : 'Xem lịch'}
                        </Button>
                    </Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm lịch trống mới
                    </Button>
                </div>

                {calendarView ? (
                    <Calendar
                        dateCellRender={dateCellRender}
                        className="custom-calendar"
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={availabilities}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                )}

                <Modal
                    title="Thêm lịch trống mới"
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
                            name="date"
                            label="Ngày"
                            rules={[ { required: true, message: 'Vui lòng chọn ngày' } ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                disabledDate={( current ) =>
                                {
                                    return current && current < dayjs().startOf( 'day' );
                                }}
                                placeholder="Chọn ngày"
                            />
                        </Form.Item>

                        <Form.Item
                            name="timeRange"
                            label="Khoảng thời gian"
                            rules={[ { required: true, message: 'Vui lòng chọn khoảng thời gian' } ]}
                        >
                            <RangePicker
                                format="HH:mm"
                                style={{ width: '100%' }}
                                placeholder={[ 'Giờ bắt đầu', 'Giờ kết thúc' ]}
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="repeat_count"
                                    label="Số khung giờ"
                                    initialValue={1}
                                    rules={[ { required: true, message: 'Vui lòng nhập số khung giờ' } ]}
                                    tooltip="Số lượng khung giờ trống liên tiếp được tạo"
                                >
                                    <InputNumber min={1} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="interval_minutes"
                                    label="Thời lượng mỗi khung giờ (phút)"
                                    initialValue={30}
                                    rules={[ { required: true, message: 'Vui lòng nhập thời lượng' } ]}
                                >
                                    <Select>
                                        <Option value={15}>15 phút</Option>
                                        <Option value={30}>30 phút</Option>
                                        <Option value={45}>45 phút</Option>
                                        <Option value={60}>60 phút</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item className="form-actions">
                            <Button type="default" onClick={() => setModalVisible( false )}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                                Tạo mới
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <style jsx global>{`
          .availability-management {
            padding: 10px;
          }
          .header-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            align-items: center;
          }
          .card-container {
            margin-bottom: 20px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .form-actions {
            display: flex;
            justify-content: flex-end;
          }
          .events {
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .events .ant-badge-status {
            width: 100%;
            overflow: hidden;
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .custom-calendar .events {
            margin: 0;
            padding: 0;
            list-style: none;
          }
        `}</style>
            </Card>
        </div>
    );
} 