import { Route } from '@/contexts/BookingContext';

export const mockRoutes: Route[] = [
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
  }
];
