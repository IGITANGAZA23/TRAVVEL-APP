import React, { createContext, useContext, useState } from 'react';

interface Route {
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

  // Mock routes data
  const mockRoutes: Route[] = [
        {
      id: '1',
      from: 'Kigali',
      to: 'Nyamasheke',
      agency: 'Ritco Ltd',
      departureTime: '12:00',
      arrivalTime: '18:00',
      price: 6000,
      availableSeats: 15,
      busType: 'Executive'
    },
    {
      id: '2',
      from: 'Kigali',
      to: 'Bugesera',
      agency: 'Volcano Express',
      departureTime: '09:30',
      arrivalTime: '11:00',
      price: 1200,
      availableSeats: 32,
      busType: 'Standard'
    },
        {
      id: '3',
      from: 'Kigali',
      to: 'Kayonza',
      agency: 'Kigali Coach',
      departureTime: '16:00',
      arrivalTime: '18:00',
      price: 2000,
      availableSeats: 22,
      busType: 'Standard'
    },
    {
      id: '4',
      from: 'Kigali',
      to: 'Rwamagana',
      agency: 'Kigali Coach',
      departureTime: '17:00',
      arrivalTime: '18:30',
      price: 1500,
      availableSeats: 28,
      busType: 'Standard'
    },
        {
      id: '5',
      from: 'Kigali',
      to: 'Gicumbi',
      agency: 'Virunga Express',
      departureTime: '14:00',
      arrivalTime: '16:00',
      price: 2000,
      availableSeats: 20,
      busType: 'Standard'
    },
    {
      id: '6',
      from: 'Kigali',
      to: 'Gisenyi',
      agency: 'Virunga Express',
      departureTime: '15:00',
      arrivalTime: '19:00',
      price: 3500,
      availableSeats: 18,
      busType: 'Executive'
    },
        {
      id: '7',
      from: 'Kigali',
      to: 'Muhanga',
      agency: 'Volcano Express',
      departureTime: '08:30',
      arrivalTime: '10:00',
      price: 1500,
      availableSeats: 40,
      busType: 'Standard'
    },
    {
      id: '8',
      from: 'Kigali',
      to: 'Ngoma',
      agency: 'Kigali Coach',
      departureTime: '13:00',
      arrivalTime: '16:00',
      price: 3000,
      availableSeats: 25,
      busType: 'Standard'
    },
        {
      id: '9',
      from: 'Kigali',
      to: 'Nyagatare',
      agency: 'Ritco Ltd',
      departureTime: '09:00',
      arrivalTime: '13:00',
      price: 4000,
      availableSeats: 35,
      busType: 'Standard'
    },
    {
      id: '10',
      from: 'Kigali',
      to: 'Karongi',
      agency: 'Ritco Ltd',
      departureTime: '11:00',
      arrivalTime: '15:00',
      price: 3500,
      availableSeats: 30,
      busType: 'Executive'
    },
        {
      id: '11',
      from: 'Kigali',
      to: 'Rubavu',
      agency: 'Ritco Ltd',
      departureTime: '07:00',
      arrivalTime: '12:00',
      price: 3500,
      availableSeats: 45,
      busType: 'Executive'
    },
    {
      id: '12',
      from: 'Kigali',
      to: 'Rusizi',
      agency: 'Ritco Ltd',
      departureTime: '06:00',
      arrivalTime: '13:00',
      price: 7000,
      availableSeats: 40,
      busType: 'Standard'
    },
        {
      id: '13',
      from: 'Kigali',
      to: 'Musanze',
      agency: 'Ritco Ltd',
      departureTime: '08:00',
      arrivalTime: '11:00',
      price: 3500,
      availableSeats: 60,
      busType: 'Executive'
    },
    {
      id: '14',
      from: 'Kigali',
      to: 'Huye',
      agency: 'Ritco Ltd',
      departureTime: '10:00',
      arrivalTime: '13:00',
      price: 2700,
      availableSeats: 50,
      busType: 'Standard'
    }
  ];

  const searchRoutes = async (from: string, to: string, date: string): Promise<Route[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filteredRoutes = mockRoutes.filter(route => 
      route.from.toLowerCase().includes(from.toLowerCase()) &&
      route.to.toLowerCase().includes(to.toLowerCase())
    );
    
    setRoutes(filteredRoutes);
    return filteredRoutes;
  };

  const bookTicket = async (route: Route, passengers: string[], paymentMethodId: string): Promise<Ticket[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTickets: Ticket[] = passengers.map((passenger, index) => ({
      id: `ticket_${Date.now()}_${index}`,
      routeId: route.id,
      route,
      passengerName: passenger,
      seatNumber: `${Math.floor(Math.random() * 40) + 1}A`,
      bookingDate: new Date().toISOString(),
      qrCode: `QR_${Date.now()}_${index}`,
      status: 'active',
      appealable: true
    }));
    
    setTickets(prev => [...prev, ...newTickets]);
    return newTickets;
  };

  const getUserTickets = (): Ticket[] => {
    return tickets;
  };

  const createAppeal = async (ticketId: string, desiredTime: string, reason: string): Promise<void> => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAppeal: Appeal = {
      id: `appeal_${Date.now()}`,
      ticketId,
      fromTicket: ticket,
      toTime: desiredTime,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setAppeals(prev => [...prev, newAppeal]);
    
    // Update ticket status
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'appealed' } : t
    ));
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