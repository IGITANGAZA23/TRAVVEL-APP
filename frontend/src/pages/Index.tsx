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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              <span className="text-slate-700">TRAVVEL</span>
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
              className="text-lg px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white border-0"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50"
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
              <Card 
                key={index} 
                className="text-center hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
                onClick={() => navigate('/login')}
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto w-16 h-16 bg-slate-100 group-hover:bg-slate-200 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
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
                <div key={index} className="text-center group cursor-pointer" onClick={() => navigate('/login')}>
                  <div className="w-12 h-12 bg-slate-700 group-hover:bg-slate-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-slate-700 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-600 group-hover:text-slate-700 transition-colors duration-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}