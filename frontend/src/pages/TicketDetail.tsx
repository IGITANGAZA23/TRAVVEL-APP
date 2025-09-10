import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingContext';
import Layout from '@/components/Layout';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { ArrowLeft, Clock, MapPin, Bus, User, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserTickets } = useBooking();
  
  const tickets = getUserTickets();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h1>
          <Button onClick={() => navigate('/my-tickets')}>
            Back to My Tickets
          </Button>
        </div>
      </Layout>
    );
  }

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

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-tickets')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Tickets
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Details</h1>
              <p className="text-gray-600 mt-2">
                Complete information for your journey
              </p>
            </div>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Information */}
          <div className="space-y-6">
            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bus className="mr-2 h-5 w-5" />
                  Journey Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {ticket.route.from} → {ticket.route.to}
                  </h3>
                  <p className="text-gray-600">{ticket.route.agency}</p>
                  <Badge variant="secondary" className="mt-2">
                    {ticket.route.busType}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Departure</p>
                      <p className="text-gray-600">{ticket.route.departureTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Arrival</p>
                      <p className="text-gray-600">{ticket.route.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Passenger Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Passenger Name</p>
                    <p className="text-gray-600">{ticket.passengerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Seat Number</p>
                    <p className="text-gray-600">{ticket.seatNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Booking Date</p>
                    <p className="text-gray-600">
                      {format(new Date(ticket.bookingDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ticket Price:</span>
                    <span className="font-medium">RWF {ticket.route.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span className="font-mono text-sm">{ticket.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="space-y-6">
            <QRCodeDisplay 
              qrCode={ticket.qrCode} 
              ticketId={ticket.id}
              size={280}
            />

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Important Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">At the Bus Station:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Arrive at least 30 minutes before departure</li>
                    <li>Present this QR code to the conductor</li>
                    <li>Have a valid ID ready for verification</li>
                    <li>The QR code will expire after scanning</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Need Help?</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>Contact agency: {ticket.route.agency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {ticket.status === 'active' && ticket.appealable && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/appeals', { state: { ticketId: ticket.id } })}
                >
                  Appeal for Time Change
                </Button>
              )}
              
              <Button 
                className="w-full" 
                onClick={() => navigate('/my-tickets')}
              >
                Back to All Tickets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}