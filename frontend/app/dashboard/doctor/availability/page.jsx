'use client';

import { useState, useEffect, Suspense } from 'react';
import AvailabilityManagement from '../../../../components/doctor/AvailabilityManagement';
import { Card, Skeleton, Alert } from 'antd';
import axios from 'axios';

export default function DoctorAvailabilityPage ()
{
    const [ doctorProfile, setDoctorProfile ] = useState( null );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState( null );

    useEffect( () =>
    {
        const fetchDoctorProfile = async () =>
        {
            try
            {
                // Trong thực tế, sẽ lấy ID của user hiện tại từ session/auth
                const currentUserId = 1; // Placeholder
                const response = await axios.get( `/api/doctors?user_id=${ currentUserId }` );

                if ( response.data && response.data.length > 0 )
                {
                    setDoctorProfile( response.data[ 0 ] );
                } else
                {
                    setError( 'Không tìm thấy thông tin bác sĩ cho tài khoản này.' );
                }
            } catch ( err )
            {
                setError( 'Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.' );
                console.error( err );
            } finally
            {
                setLoading( false );
            }
        };

        fetchDoctorProfile();
    }, [] );

    if ( loading )
    {
        return (
            <div className="availability-page">
                <Card>
                    <Skeleton active />
                </Card>
            </div>
        );
    }

    if ( error )
    {
        return (
            <div className="availability-page">
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    if ( !doctorProfile )
    {
        return (
            <div className="availability-page">
                <Alert
                    message="Không có quyền truy cập"
                    description="Bạn không có hồ sơ bác sĩ hoặc không có quyền truy cập trang này."
                    type="warning"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="availability-page">
            <Suspense fallback={<Card><Skeleton active /></Card>}>
                <AvailabilityManagement doctorId={doctorProfile.id} />
            </Suspense>

            <style jsx>{`
        .availability-page {
          padding: 16px;
        }
      `}</style>
        </div>
    );
} 