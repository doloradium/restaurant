'use client';

import { useDelivery } from '@/app/DeliveryProvider';
import { format } from 'date-fns';
import { FaMapMarkerAlt, FaClock, FaEdit } from 'react-icons/fa';

interface DeliveryInfoProps {
    onEditAddress?: () => void;
    onEditTime?: () => void;
}

export default function DeliveryInfo({
    onEditAddress,
    onEditTime,
}: DeliveryInfoProps) {
    const { deliveryAddress, deliveryTime } = useDelivery();

    if (!deliveryAddress && !deliveryTime) {
        return null;
    }

    return (
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h3 className='text-xl font-bold mb-4'>Delivery Information</h3>

            {deliveryAddress && (
                <div className='mb-4'>
                    <div className='flex justify-between items-start'>
                        <div className='flex items-start'>
                            <FaMapMarkerAlt className='text-red-600 mt-1 mr-3 flex-shrink-0' />
                            <div>
                                <h4 className='font-medium'>
                                    Delivery Address
                                </h4>
                                <p className='text-gray-700 mt-1'>
                                    {deliveryAddress.fullAddress}
                                </p>
                                {(deliveryAddress.apartment ||
                                    deliveryAddress.floor ||
                                    deliveryAddress.entrance ||
                                    deliveryAddress.intercom) && (
                                    <p className='text-gray-600 text-sm mt-1'>
                                        {[
                                            deliveryAddress.apartment &&
                                                `Apt: ${deliveryAddress.apartment}`,
                                            deliveryAddress.floor &&
                                                `Floor: ${deliveryAddress.floor}`,
                                            deliveryAddress.entrance &&
                                                `Entrance: ${deliveryAddress.entrance}`,
                                            deliveryAddress.intercom &&
                                                `Intercom: ${deliveryAddress.intercom}`,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                        {onEditAddress && (
                            <button
                                onClick={onEditAddress}
                                className='text-red-600 hover:text-red-800 flex items-center'
                            >
                                <FaEdit className='mr-1' /> Edit
                            </button>
                        )}
                    </div>
                </div>
            )}

            {deliveryTime && (
                <div>
                    <div className='flex justify-between items-start'>
                        <div className='flex items-start'>
                            <FaClock className='text-red-600 mt-1 mr-3 flex-shrink-0' />
                            <div>
                                <h4 className='font-medium'>Delivery Time</h4>
                                <p className='text-gray-700 mt-1'>
                                    {format(
                                        new Date(deliveryTime.date),
                                        'EEEE, MMMM d'
                                    )}
                                </p>
                                <p className='text-gray-600 mt-1'>
                                    {deliveryTime.timeSlot}
                                </p>
                            </div>
                        </div>
                        {onEditTime && (
                            <button
                                onClick={onEditTime}
                                className='text-red-600 hover:text-red-800 flex items-center'
                            >
                                <FaEdit className='mr-1' /> Edit
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
