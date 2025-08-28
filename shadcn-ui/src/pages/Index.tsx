import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Clock, Shield, Smartphone, Users, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: 'Mobile Tickets',
      description: 'Get your tickets instantly on your phone with QR codes'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Track departures, arrivals, and get instant notifications'
    },
    {
      icon: Users,
      title: 'Ticket Exchange',
      description: 'Appeal and exchange tickets with other passengers in real-time'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Pay safely with MTN Mobile Money, MasterCard, and more'
    },
    {
      icon: Bus,
      title: 'Multiple Agencies',
      description: 'Book tickets from various transport agencies in one app'
    },
    {
      icon: Zap,
      title: 'Quick Booking',
      description: 'Book multiple tickets for family and friends instantly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              <span className="text-blue-600">TRAVVEL</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              Your seat, your schedule
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Easy ticket booking platform that puts you in control. Book online, 
              get mobile tickets, and never worry about long lines again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose TRAVVEL?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Sign Up', desc: 'Create account & add payment method' },
                { step: '2', title: 'Search', desc: 'Find routes & agencies' },
                { step: '3', title: 'Book', desc: 'Select seats & pay securely' },
                { step: '4', title: 'Travel', desc: 'Show QR code at station' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}