'use client';

import { useState, useEffect } from 'react';
import { useDelivery, DeliveryTime } from '@/app/DeliveryProvider';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DeliveryTimeSelection() {
    const { deliveryTime, setDeliveryTime } = useDelivery();
    const [selectedDate, setSelectedDate] = useState<Date>(
        deliveryTime?.date || new Date()
    );
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
        deliveryTime?.timeSlot || ''
    );

    // Get available delivery dates (today + 6 days forward)
    const availableDates = Array(7)
        .fill(0)
        .map((_, i) => addDays(new Date(), i));

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const currentDate = new Date();
        const startHour = isToday(selectedDate)
            ? Math.max(currentDate.getHours() + 2, 10) // Minimum 2 hours from now, not earlier than 10 AM
            : 10; // Start at 10 AM for future dates

        const endHour = 22; // End at 10 PM

        for (let hour = startHour; hour <= endHour; hour++) {
            // Add slots for each hour (e.g., "12:00 - 12:30")
            slots.push(`${hour}:00 - ${hour}:30`);
            // Don't add a :30 slot for the last hour
            if (hour < endHour) {
                slots.push(`${hour}:30 - ${hour + 1}:00`);
            }
        }

        return slots;
    };

    const availableTimeSlots = generateTimeSlots();

    // Format date for display
    const formatDateLabel = (date: Date) => {
        if (isToday(date)) return 'Сегодня';
        if (isTomorrow(date)) return 'Завтра';
        return format(date, 'd MMMM, EEE', { locale: ru });
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        // Clear selected time slot when changing date
        setSelectedTimeSlot('');
    };

    const handleTimeSlotSelect = (slot: string) => {
        setSelectedTimeSlot(slot);
    };

    const handleSaveDeliveryTime = () => {
        if (!selectedTimeSlot) return;

        const deliveryTime: DeliveryTime = {
            date: selectedDate,
            timeSlot: selectedTimeSlot,
        };

        setDeliveryTime(deliveryTime);
    };

    return (
        <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-xl font-bold mb-6'>Время доставки</h3>

            <div className='mb-6'>
                <h4 className='font-medium text-gray-700 mb-3'>
                    Выберите дату
                </h4>
                <div className='flex flex-wrap gap-2'>
                    {availableDates.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => handleDateSelect(date)}
                            className={`py-2 px-4 rounded-md transition-colors ${
                                selectedDate &&
                                format(selectedDate, 'yyyy-MM-dd') ===
                                    format(date, 'yyyy-MM-dd')
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                            {formatDateLabel(date)}
                        </button>
                    ))}
                </div>
            </div>

            <div className='mb-6'>
                <h4 className='font-medium text-gray-700 mb-3'>
                    Выберите время
                </h4>
                {availableTimeSlots.length > 0 ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                        {availableTimeSlots.map((slot, index) => (
                            <button
                                key={index}
                                onClick={() => handleTimeSlotSelect(slot)}
                                className={`py-2 px-2 rounded-md text-center transition-colors ${
                                    selectedTimeSlot === slot
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className='text-gray-500'>
                        Нет доступных слотов доставки на эту дату.
                    </p>
                )}
            </div>

            <button
                onClick={handleSaveDeliveryTime}
                disabled={!selectedTimeSlot}
                className={`w-full py-3 rounded-md font-medium transition duration-200 ${
                    selectedTimeSlot
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                Подтвердить время доставки
            </button>
        </div>
    );
}
