import React, { createContext, useContext, useState } from 'react';
import { mockRoutes } from '@/contexts/data/mockRoutes';
import { API_ENDPOINTS, getAuthToken } from '@/config/api';

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

interface Ticket {
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

interface Appeal {
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
  createAppeal: (ticketId: string, desiredTime: string, reason: string) => Promise<void>;
  getAppeals: () => Appeal[];
  acceptAppeal: (appealId: string) => Promise<void>;
  routes: Route[];
  tickets: Ticket[];
  appeals: Appeal[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  // Use mock routes from external file
  const mockRoutesData = mockRoutes;

  const searchRoutes = async (from: string, to: string, date: string): Promise<Route[]> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const url = `${API_ENDPOINTS.ROUTES.ROOT}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch routes');
    }
    const payload = await response.json();
    const list = (payload?.data || []) as any[];
    const mapped: Route[] = list.map((r) => ({
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

  interface TicketResponse {
    id: string;
    routeId: string;
    passengerName: string;
    seatNumber: string;
    bookingDate: string;
    qrCode: string;
    status: 'active' | 'used' | 'cancelled' | 'appealed';
    appealable: boolean;
  }

  const bookTicket = async (route: Route, passengers: string[], paymentMethodId: string) => {
    if (!paymentMethodId) {
      throw new Error('Please select a payment method');
    }
    
    if (passengers.length === 0 || passengers.some(name => !name.trim())) {
      throw new Error('Please enter passenger names');
    }

    try {
      // Prepare the booking data in the format expected by the backend
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
          age: 25, // Default age, can be made configurable
          gender: 'other' as const,
          seatNumber: String(Math.floor(Math.random() * 50) + 1) // Random seat number as string
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
      
      // Update local state with the new tickets
      setTickets(prev => [...prev, ...newTickets]);
      
      // Define the ticket response type
      interface TicketResponse {
        id: string;
        passengerName: string;
        seatNumber: string;
        bookingDate: string;
        qrCode: string;
        status: 'active' | 'used' | 'cancelled' | 'appealed';
        appealable: boolean;
      }

      // Return the new tickets with route details
      return (newTickets as TicketResponse[]).map(ticket => ({
        ...ticket,
        route,
        routeId: route.id,
        fromTicket: {
          ...ticket,
          route,
          routeId: route.id
        } as Ticket
      }));
    } catch (error: unknown) {
      console.error('Booking error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while booking');
    }
  };

  const getUserTickets = (): Ticket[] => {
    return tickets;
  };

  const createAppeal = async (ticketId: string, desiredTime: string, reason: string) => {
    if (!ticketId || !desiredTime || !reason) {
      throw new Error('All fields are required');
    }

    try {
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
      
      // Update local state
      setAppeals(prev => [...prev, newAppeal]);
      
      // Update ticket's appeal status
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'appealed' as const }
            : ticket
        )
      );
      
      return newAppeal;
    } catch (error) {
      console.error('Appeal creation error:', error);
      throw error;
    }
  };

  const getAppeals = (): Appeal[] => {
    return appeals;
  };

  const acceptAppeal = async (appealId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAppeals(prev => prev.map(appeal => 
      appeal.id === appealId ? { ...appeal, status: 'matched' } : appeal
    ));
  };

  const value = {
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