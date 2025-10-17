import { Route } from '@/contexts/BookingContext';

export const mockRoutes: Route[] = [
  {
    id: 'huye-kigali-001',
    from: 'Huye',
    to: 'Kigali',
    agency: 'Ritco Ltd',
    departureTime: '06:00',
    arrivalTime: '09:00',
    price: 2500,
    availableSeats: 28,
    busType: 'Executive'
  },
  {
    id: 'kigali-musanze-001',
    from: 'Kigali',
    to: 'Musanze',
    agency: 'Kigali Coach',
    departureTime: '08:00',
    arrivalTime: '11:00',
    price: 3500,
    availableSeats: 25,
    busType: 'Executive'
  },
  {
    id: 'kigali-rubavu-001',
    from: 'Kigali',
    to: 'Rubavu',
    agency: 'Volcano Express',
    departureTime: '07:30',
    arrivalTime: '11:30',
    price: 4000,
    availableSeats: 22,
    busType: 'Executive'
  },
  {
    id: 'muhanga-huye-001',
    from: 'Muhanga',
    to: 'Huye',
    agency: 'Local Transport',
    departureTime: '09:00',
    arrivalTime: '10:30',
    price: 800,
    availableSeats: 18,
    busType: 'Standard'
  }
];
