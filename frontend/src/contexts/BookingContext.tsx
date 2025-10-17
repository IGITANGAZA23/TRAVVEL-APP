import React, { createContext, useContext, useState } from 'react';
import { mockRoutes } from '@/contexts/data/mockRoutes';
import { API_ENDPOINTS, getAuthToken } from '@/config/api';

// ----- Types -----
export interface Route {
  id: string;
  from: string;
  to: string;
  agency: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  busType: string;
}

export interface Ticket {
  id: string;
  routeId: string;
  route: Route;
  passengerName: string;
  seatNumber: string;
  bookingDate: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled' | 'appealed';
  appealable: boolean;
}

export interface Appeal {
  id: string;
  ticketId: string;
  fromTicket: Ticket;
  toTime: string;
  reason: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  matchedAppealId?: string;
  createdAt: string;
}

interface BookingContextType {
  searchRoutes: (from: string, to: string, date: string) => Promise<Route[]>;
  bookTicket: (route: Route, passengers: string[], paymentMethodId: string) => Promise<Ticket[]>;
  getUserTickets: () => Ticket[];
  createAppeal: (ticketId: string, desiredTime: string, reason: string) => Promise<Appeal>;
  getAppeals: () => Appeal[];
  acceptAppeal: (appealId: string) => Promise<void>;
  routes: Route[];
  tickets: Ticket[];
  appeals: Appeal[];
}

// ----- Context -----
const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};

// ----- Provider -----
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  // ----- Fetch routes -----
  const searchRoutes = async (from: string, to: string, date: string): Promise<Route[]> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const url = `${API_ENDPOINTS.ROUTES.ROOT}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch routes');

    const payload = await response.json();
    const list = (payload?.data || []) as any[];
    const mapped: Route[] = list.map(r => ({
      id: String(r._id),
      from: r.from,
      to: r.to,
      agency: r.agency,
      departureTime: r.departureTime,
      arrivalTime: r.arrivalTime,
      price: Number(r.price),
      availableSeats: Number(r.availableSeats),
      busType: r.busType,
    }));

    setRoutes(mapped);
    return mapped;
  };

  // ----- Book tickets -----
  const bookTicket = async (route: Route, passengers: string[], paymentMethodId: string): Promise<Ticket[]> => {
    if (!paymentMethodId) throw new Error('Please select a payment method');
    if (passengers.length === 0 || passengers.some(p => !p.trim())) throw new Error('Please enter passenger names');

    const bookingData = {
      route: {
        from: route.from,
        to: route.to,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        price: route.price
      },
      passengers: passengers.map(name => ({
        name: name.trim(),
        age: 25,
        gender: 'other' as const,
        seatNumber: String(Math.floor(Math.random() * 50) + 1)
      })),
      totalAmount: route.price * passengers.length,
      paymentId: paymentMethodId,
      paymentStatus: 'paid'
    };

    const response = await fetch(API_ENDPOINTS.BOOKINGS.ROOT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to book tickets');
    }

    const { data } = await response.json();
    const newTickets = data?.tickets || [];

    const normalizedTickets: Ticket[] = newTickets.map((t: any) => ({
      id: t.id || t._id || '',
      routeId: route.id,
      route,
      passengerName: t.passengerName || '',
      seatNumber: t.seatNumber || '',
      bookingDate: t.bookingDate || '',
      qrCode: t.qrCode || '',
      status: t.status || 'active',
      appealable: t.appealable ?? true,
    }));

    setTickets(prev => [...prev, ...normalizedTickets]);
    return normalizedTickets;
  };

  // ----- Get user tickets -----
  const getUserTickets = (): Ticket[] => {
    return tickets.map(t => ({
      id: t.id || t._id || '',
      routeId: t.routeId || '',
      route: t.route || {
        id: t.routeId || '',
        from: t.route?.from || '',
        to: t.route?.to || '',
        agency: t.route?.agency || 'Unknown Agency',
        departureTime: t.route?.departureTime || '',
        arrivalTime: t.route?.arrivalTime || '',
        price: t.route?.price || 0,
        availableSeats: t.route?.availableSeats || 0,
        busType: t.route?.busType || 'Standard',
      },
      passengerName: t.passengerName || '',
      seatNumber: t.seatNumber || '',
      bookingDate: t.bookingDate || '',
      qrCode: t.qrCode || '',
      status: t.status || 'active',
      appealable: t.appealable ?? true,
    }));
  };

  // ----- Create appeal -----
  const createAppeal = async (ticketId: string, desiredTime: string, reason: string): Promise<Appeal> => {
    if (!ticketId || !desiredTime || !reason) throw new Error('All fields are required');

    const response = await fetch(API_ENDPOINTS.APPEALS.ROOT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        ticketId,
        subject: `Change request to ${desiredTime}`,
        description: reason
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appeal');
    }

    const { data: newAppeal } = await response.json();

    setAppeals(prev => [...prev, newAppeal]);
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: 'appealed' } : t))
    );

    return newAppeal;
  };

  // ----- Get appeals -----
  const getAppeals = (): Appeal[] => appeals;

  // ----- Accept appeal -----
  const acceptAppeal = async (appealId: string): Promise<void> => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAppeals(prev =>
      prev.map(a => (a.id === appealId ? { ...a, status: 'matched' } : a))
    );
  };

  // ----- Context value -----
  const value: BookingContextType = {
    searchRoutes,
    bookTicket,
    getUserTickets,
    createAppeal,
    getAppeals,
    acceptAppeal,
    routes,
    tickets,
    appeals
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
