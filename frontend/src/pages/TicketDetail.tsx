import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { ArrowLeft, Clock, MapPin, Bus, User, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { API_ENDPOINTS, getAuthToken } from '@/config/api';

interface TicketDetailType {
  id: string;
  journeyDetails: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    seatNumber: string;
  };
  passenger: {
    name: string;
    age: number;
    gender: string;
  };
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qrCode: string;
  price: number;
  createdAt: string;
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) {
        setError('Missing ticket id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url = API_ENDPOINTS.TICKETS.ONE(id);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Ticket not found');
          } else if (response.status === 401) {
            setError('You must be logged in to view this ticket');
          } else {
            setError('Failed to load ticket');
          }
          setLoading(false);
          return;
        }

        const payload = await response.json();
        const t = payload?.data;
        const mapped: TicketDetailType = {
          id: String(t._id),
          journeyDetails: {
            from: t.journeyDetails?.from,
            to: t.journeyDetails?.to,
            departureTime: t.journeyDetails?.departureTime,
            arrivalTime: t.journeyDetails?.arrivalTime,
            seatNumber: t.journeyDetails?.seatNumber,
          },
          passenger: {
            name: t.passenger?.name,
            age: t.passenger?.age,
            gender: t.passenger?.gender,
          },
          status: t.status,
          qrCode: t.qrCode,
          price: Number(t.price || 0),
          createdAt: t.createdAt,
        };

        setTicket(mapped);
      } catch (err) {
        console.error('Error fetching ticket detail:', err);
        setError('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </Layout>
    );
  }

  if (!ticket || error) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h1>
          {error && <p className="text-gray-600 mb-4">{error}</p>}
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
      case 'expired':
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
                    {ticket.journeyDetails?.from ?? 'Unknown'} → {ticket.journeyDetails?.to ?? 'Unknown'}
                  </h3>
                  <p className="text-gray-600">Bus ticket</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Departure</p>
                      <p className="text-gray-600">
                        {ticket.journeyDetails?.departureTime
                          ? new Date(ticket.journeyDetails.departureTime).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Arrival</p>
                      <p className="text-gray-600">
                        {ticket.journeyDetails?.arrivalTime
                          ? new Date(ticket.journeyDetails.arrivalTime).toLocaleString()
                          : 'N/A'}
                      </p>
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
                    <p className="text-gray-600">{ticket.passenger?.name ?? 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Seat Number</p>
                      <p className="text-gray-600">{ticket.journeyDetails?.seatNumber ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Booking Date</p>
                    <p className="text-gray-600">
                      {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMMM dd, yyyy') : 'N/A'}
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
                    <span className="font-medium">RWF {ticket.price.toLocaleString()}</span>
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
              qrCode={ticket.qrCode ?? ''} 
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
                    <span>Contact agency: Customer Support</span>
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
