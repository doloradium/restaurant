'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

export interface DeliveryAddress {
    fullAddress: string;
    street: string;
    houseNumber: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    intercom?: string;
    city: string;
    zipCode?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface DeliveryTime {
    date: Date;
    timeSlot: string;
}

interface DeliveryContextType {
    deliveryAddress: DeliveryAddress | null;
    deliveryTime: DeliveryTime | null;
    setDeliveryAddress: (address: DeliveryAddress) => void;
    setDeliveryTime: (time: DeliveryTime) => void;
    clearDeliveryInfo: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(
    undefined
);

export const useDelivery = () => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
};

export default function DeliveryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [deliveryAddress, setDeliveryAddress] =
        useState<DeliveryAddress | null>(null);
    const [deliveryTime, setDeliveryTime] = useState<DeliveryTime | null>(null);

    // Load delivery info from localStorage on initial load
    useEffect(() => {
        const savedAddress = localStorage.getItem('deliveryAddress');
        const savedTime = localStorage.getItem('deliveryTime');

        if (savedAddress) {
            try {
                setDeliveryAddress(JSON.parse(savedAddress));
            } catch (error) {
                console.error('Failed to parse saved delivery address', error);
                localStorage.removeItem('deliveryAddress');
            }
        }

        if (savedTime) {
            try {
                const parsedTime = JSON.parse(savedTime);
                // Convert date string back to Date object
                if (parsedTime.date) {
                    parsedTime.date = new Date(parsedTime.date);
                }
                setDeliveryTime(parsedTime);
            } catch (error) {
                console.error('Failed to parse saved delivery time', error);
                localStorage.removeItem('deliveryTime');
            }
        }
    }, []);

    // Save delivery info to localStorage whenever it changes
    useEffect(() => {
        if (deliveryAddress) {
            localStorage.setItem(
                'deliveryAddress',
                JSON.stringify(deliveryAddress)
            );
        }
    }, [deliveryAddress]);

    useEffect(() => {
        if (deliveryTime) {
            localStorage.setItem('deliveryTime', JSON.stringify(deliveryTime));
        }
    }, [deliveryTime]);

    const clearDeliveryInfo = () => {
        setDeliveryAddress(null);
        setDeliveryTime(null);
        localStorage.removeItem('deliveryAddress');
        localStorage.removeItem('deliveryTime');
    };

    const value = {
        deliveryAddress,
        deliveryTime,
        setDeliveryAddress,
        setDeliveryTime,
        clearDeliveryInfo,
    };

    return (
        <DeliveryContext.Provider value={value}>
            {children}
        </DeliveryContext.Provider>
    );
}
