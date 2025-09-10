import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBooking } from '@/contexts/BookingContext';
import Layout from '@/components/Layout';
import { MessageSquare, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Appeals() {
  const location = useLocation();
  const { getUserTickets, createAppeal, getAppeals, acceptAppeal } = useBooking();
  
  const ticketIdFromState = location.state?.ticketId;
  const [selectedTicketId, setSelectedTicketId] = useState(ticketIdFromState || '');
  const [desiredTime, setDesiredTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tickets = getUserTickets();
  const appeals = getAppeals();
  const appealableTickets = tickets.filter(t => t.status === 'active' && t.appealable);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicketId || !desiredTime || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAppeal(selectedTicketId, desiredTime, reason);
      toast.success('Appeal submitted successfully!');
      setSelectedTicketId('');
      setDesiredTime('');
      setReason('');
    } catch (error) {
      toast.error('Failed to submit appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAppeal = async (appealId: string) => {
    try {
      await acceptAppeal(appealId);
      toast.success('Appeal accepted! You will be matched with another passenger.');
    } catch (error) {
      toast.error('Failed to accept appeal. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Appeals</h1>
          <p className="text-gray-600 mt-2">
            Request time changes and exchange tickets with other passengers
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Appeal</TabsTrigger>
            <TabsTrigger value="my-appeals">My Appeals</TabsTrigger>
            <TabsTrigger value="available">Available Exchanges</TabsTrigger>
          </TabsList>

          {/* Create Appeal */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Create New Appeal
                </CardTitle>
                <CardDescription>
                  Request a time change for your ticket and get matched with other passengers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appealableTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appealable tickets</h3>
                    <p className="text-gray-600">
                      You don't have any active tickets that can be appealed at the moment.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAppeal} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="ticket">Select Ticket</Label>
                      <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a ticket to appeal" />
                        </SelectTrigger>
                        <SelectContent>
                          {appealableTickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                              <div className="flex flex-col">
                                <span>{ticket.route.from} → {ticket.route.to}</span>
                                <span className="text-sm text-gray-500">
                                  {ticket.route.agency} • Departure: {ticket.route.departureTime}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desiredTime">Desired Departure Time</Label>
                      <Select value={desiredTime} onValueChange={setDesiredTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Appeal</Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why you need to change your departure time"
                        rows={4}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Submitting Appeal...' : 'Submit Appeal'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Appeals */}
          <TabsContent value="my-appeals">
            <div className="space-y-4">
              {appeals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appeals yet</h3>
                    <p className="text-gray-600">
                      You haven't submitted any appeals. Create your first appeal to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                appeals.map((appeal) => (
                  <Card key={appeal.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {appeal.fromTicket.route.from} → {appeal.fromTicket.route.to}
                            </h3>
                            <Badge className={getStatusColor(appeal.status)}>
                              {appeal.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            Current time: {appeal.fromTicket.route.departureTime}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Desired time: {appeal.toTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Created: {format(new Date(appeal.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {appeal.reason}
                        </p>
                      </div>

                      {appeal.status === 'matched' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="text-blue-800 text-sm">
                              Great! Your appeal has been matched with another passenger. 
                              The exchange will be processed automatically.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Available Exchanges */}
          <TabsContent value="available">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Ticket Exchanges</CardTitle>
                  <CardDescription>
                    Help other passengers by accepting their appeal requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mock available appeals from other users */}
                  <div className="space-y-4">
                    {[
                      {
                        id: 'mock1',
                        route: 'Kigali → Huye',
                        currentTime: '11:00',
                        desiredTime: '10:00',
                        reason: 'Need to arrive earlier for important meeting'
                      },
                      {
                        id: 'mock2',
                        route: 'Kigali → Huye',
                        currentTime: '11:30',
                        desiredTime: '10:00',
                        reason: 'Flight delay, need later departure'
                      }
                    ].map((mockAppeal, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">{mockAppeal.route}</h4>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-2">
                                  Has: {mockAppeal.currentTime}
                                </span>
                                <ArrowRight className="h-4 w-4 mx-2" />
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  Wants: {mockAppeal.desiredTime}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>Reason:</strong> {mockAppeal.reason}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast.info('Feature coming soon! Real-time matching will be available.')}
                            >
                              Accept Exchange
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}