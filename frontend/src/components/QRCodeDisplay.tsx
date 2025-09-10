import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeDisplayProps {
  qrCode: string;
  ticketId: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, ticketId, size = 200 }) => {
  // Generate a simple QR code pattern (in real app, use proper QR code library)
  const generateQRPattern = (data: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = size;
    canvas.height = size;
    
    // Create a simple pattern based on the data
    const gridSize = 20;
    const cellSize = size / gridSize;
    
    ctx.fillStyle = '#000000';
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Create pseudo-random pattern based on data and position
        const hash = data.charCodeAt((i * gridSize + j) % data.length) + i + j;
        if (hash % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Your Ticket QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <img 
            src={generateQRPattern(qrCode)} 
            alt="QR Code"
            className="block"
            style={{ width: size, height: size }}
          />
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