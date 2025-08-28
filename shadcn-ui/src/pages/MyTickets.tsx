import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingContext';
import Layout from '@/components/Layout';
import { Ticket, Clock, MapPin, Bus, QrCode, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function MyTickets() {
  const navigate = useNavigate();
  const { getUserTickets } = useBooking();
  
  const tickets = getUserTickets();
  const activeTickets = tickets.filter(t => t.status === 'active');
  const usedTickets = tickets.filter(t => t.status === 'used');
  const appealedTickets = tickets.filter(t => t.status === 'appealed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'appealed':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const TicketCard = ({ ticket }: { ticket: { id: string; route: { from: string; to: string; agency: string; departureTime: string; arrivalTime: string; price: number }; passengerName: string; seatNumber: string; bookingDate: string; status: string; appealable: boolean } }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold">
                {ticket.route.from} → {ticket.route.to}
              </h3>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
            <p className="text-gray-600 flex items-center mb-1">
              <Bus className="mr-2 h-4 w-4" />
              {ticket.route.agency} • Seat {ticket.seatNumber}
            </p>
            <p className="text-gray-600 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Passenger: {ticket.passengerName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-600">
              RWF {ticket.route.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Booked: {format(new Date(ticket.bookingDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">Departure</p>
              <p>{ticket.route.departureTime}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">Arrival</p>
              <p>{ticket.route.arrivalTime}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/ticket/${ticket.id}`)}
            className="flex-1"
          >
            <QrCode className="mr-2 h-4 w-4" />
            View QR Code
          </Button>
          {ticket.status === 'active' && ticket.appealable && (
            <Button
              variant="outline"
              onClick={() => navigate('/appeals', { state: { ticketId: ticket.id } })}
              className="flex-1"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Appeal Time
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (tickets.length === 0) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No tickets yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't booked any tickets. Start your journey by searching for routes.
            </p>
            <Button onClick={() => navigate('/search')}>
              Search Routes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage your booked tickets and travel plans
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeTickets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Used Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{usedTickets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Appeals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{appealedTickets.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Tickets ({activeTickets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* Appealed Tickets */}
        {appealedTickets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Appeals ({appealedTickets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {appealedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* Used Tickets */}
        {usedTickets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Travel History ({usedTickets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}