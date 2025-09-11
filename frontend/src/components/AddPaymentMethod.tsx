import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AddPaymentMethodProps {
  onClose: () => void;
  onAdd: (method: { type: string; identifier: string; isDefault: boolean }) => void;
  showCloseButton?: boolean;
}

export function AddPaymentMethod({ onClose, onAdd, showCloseButton = true }: AddPaymentMethodProps) {
  const [type, setType] = useState('mtn_mobile_money');
  const [identifier, setIdentifier] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentTypes = [
    { value: 'mtn_mobile_money', label: 'MTN Mobile Money' },
    { value: 'airtel_money', label: 'Airtel Money' },
    { value: 'mastercard', label: 'MasterCard' },
    { value: 'visa', label: 'Visa' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!identifier.trim()) {
      alert('Please enter a valid identifier (phone number or card number)');
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, you would validate the payment method with a payment processor
    // and save it to your backend before calling onAdd
    
    // Simulate API call
    setTimeout(() => {
      onAdd({
        type,
        identifier: identifier.trim(),
        isDefault
      });
      
      // Reset form
      setIdentifier('');
      setIsSubmitting(false);
      
      // Close the modal if needed
      if (onClose) {
        onClose();
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Payment Method</CardTitle>
          {showCloseButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Add a new payment method to complete your booking
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Payment Method Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="identifier">
              {type.includes('mobile_money') || type.includes('money') 
                ? 'Phone Number' 
                : 'Card Number'}
            </Label>
            <Input
              id="identifier"
              type={type.includes('mobile_money') || type.includes('money') ? 'tel' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                type.includes('mobile_money') || type.includes('money')
                  ? 'e.g., +250700000000'
                  : 'Card number'
              }
              required
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
              Set as default payment method
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {showCloseButton && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={!identifier.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
