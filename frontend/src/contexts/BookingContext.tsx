import React, { createContext, useContext, useState } from 'react';
import { mockRoutes } from '@/data/mockRoutes';

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filteredRoutes = mockRoutesData.filter(route => 
      route.from.toLowerCase().includes(from.toLowerCase()) &&
      route.to.toLowerCase().includes(to.toLowerCase())
    );
    
    setRoutes(filteredRoutes);
    return filteredRoutes;
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
          seatNumber: Math.floor(Math.random() * 50) + 1 // Random seat number
        })),
        totalAmount: route.price * passengers.length,
        paymentId: paymentMethodId,
        paymentStatus: 'completed'
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book tickets');
      }

      const { tickets: newTickets } = await response.json();
      
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
        route, // Include the full route details
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
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ticketId,
          desiredTime,
          reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appeal');
      }

      const newAppeal = await response.json();
      
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