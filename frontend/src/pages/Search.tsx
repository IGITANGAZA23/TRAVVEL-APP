import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingContext';
import Layout from '@/components/Layout';
import { Search as SearchIcon, MapPin, Clock, Users, Bus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const navigate = useNavigate();
  const { searchRoutes, routes } = useBooking();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchForm.from || !searchForm.to) {
      toast.error('Please enter both departure and destination');
      return;
    }

    setIsSearching(true);
    try {
      await searchRoutes(searchForm.from, searchForm.to, searchForm.date);
      if (routes.length === 0) {
        toast.info('No routes found for your search criteria');
      }
    } catch (error) {
      toast.error('Failed to search routes. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookRoute = (route: { id: string; from: string; to: string; agency: string; departureTime: string; arrivalTime: string; price: number; availableSeats: number; busType: string }) => {
    navigate('/booking', { state: { selectedRoute: route } });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Routes</h1>
          <p className="text-gray-600 mt-2">
            Find the perfect route for your journey
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SearchIcon className="mr-2 h-5 w-5" />
              Route Search
            </CardTitle>
            <CardDescription>
              Enter your travel details to find available routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="from"
                      value={searchForm.from}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="Departure city"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="to"
                      value={searchForm.to}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="Destination city"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Travel Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSearching} className="w-full md:w-auto">
                {isSearching ? 'Searching...' : 'Search Routes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {routes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Available Routes ({routes.length})
            </h2>
            <div className="space-y-4">
              {routes.map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {route.from} → {route.to}
                            </h3>
                            <p className="text-gray-600 flex items-center">
                              <Bus className="mr-1 h-4 w-4" />
                              {route.agency}
                            </p>
                          </div>
                          <Badge variant="secondary">{route.busType}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-gray-400" />
                            <span>Depart: {route.departureTime}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-gray-400" />
                            <span>Arrive: {route.arrivalTime}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4 text-gray-400" />
                            <span>{route.availableSeats} seats left</span>
                          </div>
                          <div className="font-semibold text-green-600">
                            RWF {route.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Button 
                          onClick={() => handleBookRoute(route)}
                          disabled={route.availableSeats === 0}
                        >
                          {route.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Popular Routes */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 'Kigali', to: 'Huye', price: '3700' },
              { from: 'Huye', to: 'Kigali', price: '3700' },
              { from: 'Musanze', to: 'Kigali', price: '2400' },
              { from: 'Rubavu', to: 'Kigali', price: '4950'},
              { from: 'Muhanga', to: 'Kigali', price: '2100' },
              { from: 'Kigali', to: 'Rubavu', price: '4950' }
            ].map((route, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{route.from} → {route.to}</h3>
                      <p className="text-sm text-gray-600">Starting from RWF {route.price}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}