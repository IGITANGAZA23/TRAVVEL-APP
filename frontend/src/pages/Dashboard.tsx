import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import Layout from '@/components/Layout';
import { Search, Ticket, Clock, MessageSquare, Plus } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserTickets } = useBooking();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const tickets = getUserTickets();
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const appealedTickets = tickets.filter(t => t.status === 'appealed').length;

  const quickActions = [
    {
      icon: Search,
      title: 'Search Routes',
      description: 'Find and book new tickets',
      action: () => navigate('/search'),
      color: 'bg-slate-600'
    },
    {
      icon: Ticket,
      title: 'My Tickets',
      description: 'View your booked tickets',
      action: () => navigate('/my-tickets'),
      color: 'bg-slate-700'
    },
    {
      icon: MessageSquare,
      title: 'Appeals',
      description: 'Manage ticket exchanges',
      action: () => navigate('/appeals'),
      color: 'bg-slate-500'
    }
  ];

  return (
    <Layout>
      <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your bookings and travel plans from your dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Active Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTickets}</div>
              <p className="text-xs text-slate-500">
                Ready for travel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Bookings</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
              <p className="text-xs text-slate-500">
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Pending Appeals</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appealedTickets}</div>
              <p className="text-xs text-slate-500">
                Awaiting exchange
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white border border-slate-200 shadow-sm" onClick={action.action}>
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-800">{action.title}</CardTitle>
                  <CardDescription className="text-slate-600">{action.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Recent Tickets</h2>
            <Button variant="outline" onClick={() => navigate('/my-tickets')} className="border-slate-300 text-slate-700 hover:bg-slate-50">
              View All
            </Button>
          </div>
          
          {tickets.length === 0 ? (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No tickets yet</h3>
                <p className="text-slate-600 text-center mb-6">
                  Start by searching for routes and booking your first ticket
                </p>
                <Button onClick={() => navigate('/search')} className="bg-slate-700 hover:bg-slate-800 text-white border-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.slice(0, 3).map((ticket) => (
                <Card key={ticket.id} className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {ticket.route.from} → {ticket.route.to}
                      </h3>
                      <p className="text-slate-600">
                        {ticket.route.agency} • Seat {ticket.seatNumber}
                      </p>
                      <p className="text-sm text-slate-500">
                        Departure: {ticket.route.departureTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'appealed' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <p className="text-sm text-slate-500 mt-1">
                        RWF {ticket.route.price.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}