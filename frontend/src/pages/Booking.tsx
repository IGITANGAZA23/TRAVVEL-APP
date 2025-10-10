import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Bus, Clock, Users, CreditCard, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AddPaymentMethod } from '@/components/AddPaymentMethod';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api } from '@/services/api';

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addPaymentMethod } = useAuth();
  
  const selectedRoute = location.state?.selectedRoute;
  const travelDate: string | undefined = location.state?.travelDate;
  const [passengers, setPassengers] = useState([user?.name || '']);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  useEffect(() => {
    if (!selectedRoute) {
      navigate('/search');
      return;
    }
    // Initialize payment method selection if user has payment methods
    if (user?.paymentMethods?.length > 0) {
      const defaultMethod = user.paymentMethods.find(pm => pm.isDefault);
      setSelectedPaymentMethod(defaultMethod?.id || user.paymentMethods[0]?.id || '');
    } else {
      setSelectedPaymentMethod('');
    }
  }, [selectedRoute, navigate, user]);

  if (!selectedRoute || !user) {
    return null;
  }

  const addPassenger = () => {
    if (passengers.length < 5) {
      setPassengers([...passengers, '']);
    }
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, name: string) => {
    const updated = [...passengers];
    updated[index] = name;
    setPassengers(updated);
  };

  type PaymentMethodType = 'mtn_mobile_money' | 'airtel_money' | 'mastercard' | 'visa';

  const handleAddPaymentMethod = async (method: { type: string; identifier: string; isDefault: boolean }) => {
    try {
      setIsAddingPayment(true);
      await addPaymentMethod({
        type: method.type as PaymentMethodType,
        identifier: method.identifier,
        isDefault: method.isDefault
      });
      toast.success('Payment method added successfully');
      setShowAddPaymentMethod(false);
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method. Please try again.');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleBooking = async () => {
    const validPassengers = passengers.filter(name => name.trim() !== '');
    
    if (validPassengers.length === 0) {
      toast.error('Please enter at least one passenger name');
      return;
    }

    if (!selectedPaymentMethod && user?.paymentMethods?.length === 0) {
      toast.error('Please add a payment method to continue');
      setShowAddPaymentMethod(true);
      return;
    }
    
    if (!selectedPaymentMethod && user?.paymentMethods?.length > 0) {
      toast.error('Please select a payment method');
      return;
    }

    if (validPassengers.length > selectedRoute.availableSeats) {
      toast.error(`Only ${selectedRoute.availableSeats} seats available`);
      return;
    }

    setIsBooking(true);
    try {
      // Coerce route times to ISO datetimes on the chosen date
      const toISO = (time: string) => {
        if (!travelDate) return time;
        const [hour, minute] = String(time).split(':');
        const dt = new Date(travelDate);
        dt.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
        return dt.toISOString();
      };

      const bookingData = {
        routeId: selectedRoute.id,
        passengers: validPassengers.map((name, index) => ({
          name: name.trim(),
          age: 25, // Default age, could be made configurable
          gender: 'other' as const,
          seatNumber: `SEAT-${index + 1}`
        })),
        totalAmount: validPassengers.length * selectedRoute.price,
        paymentStatus: 'pending',
        paymentId: selectedPaymentMethod
      };

      const response = await api.post('/api/bookings', bookingData);
      
      if (response.success) {
        toast.success(`Successfully booked ${response.data.tickets.length} ticket(s)!`);
        navigate('/my-tickets');
      } else {
        throw new Error(response.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book tickets. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const totalAmount = passengers.filter(name => name.trim() !== '').length * selectedRoute.price;

  const paymentMethodLabels: { [key: string]: string } = {
    'mtn_mobile_money': 'MTN Mobile Money',
    'airtel_money': 'Airtel Money',
    'mastercard': 'MasterCard',
    'visa': 'Visa'
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Complete Your Booking</h1>
          <p className="text-slate-600 mt-2">
            Review details and add passengers for your journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <Bus className="mr-2 h-5 w-5 text-slate-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {selectedRoute.from} → {selectedRoute.to}
                    </h3>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">{selectedRoute.busType}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium">Departure</p>
                        <p>{selectedRoute.departureTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium">Arrival</p>
                        <p>{selectedRoute.arrivalTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-medium">Agency: {selectedRoute.agency}</span>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-slate-400" />
                      <span className="text-sm">{selectedRoute.availableSeats} seats available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passengers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800">Passengers</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addPassenger}
                    disabled={passengers.length >= 5}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Passenger
                  </Button>
                </div>
                <CardDescription className="text-slate-600">
                  Add up to 5 passengers for this booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor={`passenger-${index}`}>
                          Passenger {index + 1} {index === 0 && '(You)'}
                        </Label>
                        <Input
                          id={`passenger-${index}`}
                          value={passenger}
                          onChange={(e) => updatePassenger(index, e.target.value)}
                          placeholder="Full name as on ID"
                          className="mt-1"
                        />
                      </div>
                      {passengers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePassenger(index)}
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <CreditCard className="mr-2 h-5 w-5 text-slate-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Select Payment Method</Label>
                  {user?.paymentMethods?.length > 0 ? (
                    <>
                      <Select 
                        value={selectedPaymentMethod} 
                        onValueChange={setSelectedPaymentMethod}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {user.paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              <div className="flex items-center space-x-3">
                                <span>{paymentMethodLabels[method.type]}</span>
                                <span className="text-slate-500">({method.identifier})</span>
                                {method.isDefault && (
                                  <Badge className="bg-slate-100 text-slate-700 text-xs">Default</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end">
                        <Button 
                          variant="link" 
                          className="text-sm text-blue-600 p-0 h-auto"
                          onClick={() => setShowAddPaymentMethod(true)}
                        >
                          + Add New Payment Method
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border border-dashed rounded-lg text-center">
                        <p className="text-sm text-slate-600 mb-3">No payment methods found</p>
                        <Button 
                          variant="outline"
                          onClick={() => setShowAddPaymentMethod(true)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Route:</span>
                    <span>{selectedRoute.from} → {selectedRoute.to}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Agency:</span>
                    <span>{selectedRoute.agency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Departure:</span>
                    <span>{selectedRoute.departureTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price per ticket:</span>
                    <span>RWF {selectedRoute.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passengers:</span>
                    <span>{passengers.filter(name => name.trim() !== '').length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-slate-700 font-bold">
                      RWF {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleBooking} 
                  disabled={isBooking || passengers.filter(name => name.trim() !== '').length === 0}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white border-0"
                  size="lg"
                >
                  {isBooking ? 'Processing...' : `Book ${passengers.filter(name => name.trim() !== '').length} Ticket(s)`}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  You will receive QR codes for all tickets after successful payment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentMethod} onOpenChange={setShowAddPaymentMethod}>
        <DialogContent className="sm:max-w-[425px]">
          <AddPaymentMethod 
            onClose={() => setShowAddPaymentMethod(false)}
            onAdd={handleAddPaymentMethod}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}