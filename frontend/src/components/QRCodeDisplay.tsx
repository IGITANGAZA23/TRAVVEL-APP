import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  qrCode: string;
  ticketId: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, ticketId, size = 200 }) => {
  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Your Ticket QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCode value={qrCode} size={size} />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Ticket ID: {ticketId}</p>
          <p className="text-xs text-gray-500 mt-1">
            Present this QR code at the bus station
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;