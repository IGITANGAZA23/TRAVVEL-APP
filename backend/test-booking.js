const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBooking() {
  try {
    console.log('Testing booking endpoint...');
    
    const bookingData = {
      routeId: "huye-kigali-001",
      passengers: [
        {
          name: "John Doe",
          age: 30,
          gender: "male",
          seatNumber: "SEAT-1"
        }
      ],
      totalAmount: 2500,
      paymentStatus: "pending",
      paymentId: "payment-123"
    };

    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Booking successful!');
      console.log(`📋 Booking ID: ${result.data.booking._id}`);
      console.log(`🎫 Tickets created: ${result.data.tickets.length}`);
      console.log(`💺 Seats reserved: ${result.data.booking.passengers.length}`);
      
      // Check if seats were updated
      const routeResponse = await fetch('http://localhost:5000/api/routes/huye-kigali-001');
      const routeData = await routeResponse.json();
      console.log(`🚌 Available seats after booking: ${routeData.data.availableSeats}`);
      
    } else {
      console.log('❌ Booking failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing booking:', error.message);
  }
}

testBooking();
