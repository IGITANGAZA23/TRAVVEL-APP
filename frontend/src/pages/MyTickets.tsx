import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, getAuthToken } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Ticket, Clock, MapPin, Bus, QrCode, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppealTicket } from '@/components/AppealTicket';

interface TicketType {
  id: string;
  route: {
    from: string;
    to: string;
    agency: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  passengerName: string;
  seatNumber: string;
  bookingDate: string;
  status: 'active' | 'used' | 'cancelled' | 'appealed';
  appealable: boolean;
  appealStatus?: 'pending' | 'in_review' | 'resolved' | 'rejected';
}

export default function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const url = API_ENDPOINTS.TICKETS.ROOT;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        
        const payload = await response.json();
        const list = payload?.data || [];
        // Map backend Ticket model to UI shape expected here
        const mapped = list.map((t: any) => ({
          id: String(t._id),
          route: {
            from: t.journeyDetails?.from,
            to: t.journeyDetails?.to,
            agency: 'Agency',
            departureTime: new Date(t.journeyDetails?.departureTime).toLocaleString(),
            arrivalTime: new Date(t.journeyDetails?.arrivalTime).toLocaleString(),
            price: Number(t.price || 0)
          },
          passengerName: t.passenger?.name,
          seatNumber: t.journeyDetails?.seatNumber,
          bookingDate: t.createdAt,
          status: t.status === 'expired' ? 'used' : t.status,
          appealable: t.status === 'active'
        }));
        setTickets(mapped);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        // Handle error (show toast, etc.)
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTickets();
    }
  }, [user]);
  
  const activeTickets = tickets.filter(t => t.status === 'active');
  const usedTickets = tickets.filter(t => t.status === 'used');
  const appealedTickets = tickets.filter(t => t.status === 'appealed' || t.appealStatus);
  
  const handleAppealClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setShowAppealDialog(true);
  };
  
  const handleAppealSuccess = () => {
    // Refresh tickets after successful appeal
    setTickets(prevTickets => 
      prevTickets.map(t => 
        t.id === selectedTicket?.id 
          ? { ...t, status: 'appealed', appealStatus: 'pending' as const } 
          : t
      )
    );
    setShowAppealDialog(false);
    setSelectedTicket(null);
  };

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





  const TicketCard = ({ 
    ticket, 
    onAppealClick 
  }: { 
    ticket: TicketType; 
    onAppealClick: (ticket: TicketType) => void; 
  }) => (

//new card with resolved issues 
<Card className="hover:shadow-lg transition-shadow">
  <CardContent className="p-6">
    {/* Header */}
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

    {/* Departure / Arrival */}
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

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-2 mt-2">
      {/* View QR Button */}
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => {
          console.log('View QR code for ticket:', ticket.id);
          navigate(`/ticket/${ticket.id}`);
        }}
      >
        <QrCode className="mr-2 h-4 w-4" /> View QR
      </Button>

      {/* Appeal Button */}
      {ticket.status === 'active' && ticket.appealable && (
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAppealClick(ticket)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {ticket.appealStatus ? 'View Appeal' : 'Appeal'}
        </Button>
      )}

      {/* Appeal Status Badge */}
      {ticket.appealStatus && (
        <Badge
          variant="outline"
          className={`ml-2 ${
            ticket.appealStatus === 'resolved'
              ? 'bg-green-100 text-green-800'
              : ticket.appealStatus === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {ticket.appealStatus.charAt(0).toUpperCase() +
            ticket.appealStatus.slice(1)}
        </Badge>
      )}
    </div>
  </CardContent>
</Card>



  );


  

  const renderTicketSection = (ticketList: TicketType[], title: string, emptyMessage: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      
      {ticketList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ticketList.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onAppealClick={handleAppealClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Tickets</h1>
            <p className="text-gray-600">Manage and view your travel tickets</p>
          </div>
          <Button 
            onClick={() => navigate('/search')}
            className="whitespace-nowrap"
          >
            <Ticket className="mr-2 h-4 w-4" /> Book New Trip
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past Trips</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="active">
              {renderTicketSection(
                activeTickets,
                'Active Tickets',
                'No active tickets found',
                <Ticket className="h-5 w-5 text-blue-600" />
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {renderTicketSection(
                usedTickets,
                'Past Trips',
                'No past trips found',
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </TabsContent>
            
            <TabsContent value="appeals">
              {renderTicketSection(
                appealedTickets,
                'My Appeals',
                'No appeals found',
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
            </TabsContent>
          </div>
        </Tabs>

        {tickets.length === 0 && !loading && (
          <div className="text-center py-12">
            <Ticket className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-gray-500">You haven't booked any tickets yet.</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/')}>
                <Ticket className="mr-2 h-4 w-4" /> Browse Trips
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Appeal Dialog */}
      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <AppealTicket 
              ticketId={selectedTicket.id} 
              onSuccess={handleAppealSuccess}
              onClose={() => setShowAppealDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}