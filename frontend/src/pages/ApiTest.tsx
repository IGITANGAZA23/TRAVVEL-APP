import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function ApiTest() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing API connection...');
      const response = await api.getRoutes();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        setRoutes(response.data);
        toast.success(`Successfully loaded ${response.data.length} routes from API`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to connect to API');
      toast.error('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const testSearchApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing search API...');
      const response = await api.getRoutesByOriginDestination('Huye', 'Kigali');
      console.log('Search API Response:', response);
      
      if (response.success && response.data) {
        setRoutes(response.data);
        toast.success(`Found ${response.data.length} routes from Huye to Kigali`);
      } else {
        throw new Error('Invalid search response format');
      }
    } catch (err: any) {
      console.error('Search API Error:', err);
      setError(err.message || 'Failed to search routes');
      toast.error('Failed to search routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testApiConnection();
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Connection Test</h1>
          <p className="text-gray-600 mt-2">
            Test the connection between frontend and backend services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>API Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testApiConnection} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test All Routes API'}
              </Button>
              
              <Button 
                onClick={testSearchApi} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Searching...' : 'Test Search API (Huye → Kigali)'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <Badge variant="destructive" className="mb-2">❌ Error</Badge>
              ) : routes.length > 0 ? (
                <Badge variant="default" className="mb-2">✅ Connected</Badge>
              ) : (
                <Badge variant="secondary" className="mb-2">⏳ Testing</Badge>
              )}
              
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              
              {routes.length > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  Successfully loaded {routes.length} routes
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {routes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Loaded Routes ({routes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {routes.map((route, index) => (
                  <div key={route.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        {route.from} → {route.to}
                      </h3>
                      <Badge variant="outline">{route.busType}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Agency:</strong> {route.agency}
                      </div>
                      <div>
                        <strong>Departure:</strong> {route.departureTime}
                      </div>
                      <div>
                        <strong>Arrival:</strong> {route.arrivalTime}
                      </div>
                      <div>
                        <strong>Price:</strong> RWF {route.price?.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <strong>Available Seats:</strong> {route.availableSeats}
                      {route.routeType && (
                        <span className="ml-4">
                          <strong>Type:</strong> {route.routeType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
