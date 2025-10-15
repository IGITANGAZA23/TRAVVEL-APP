const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testBooking() {
  try {
    console.log('Testing booking endpoint...');

    const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWZkNjhhMWVjOWFmMTZlODU4NDA2YiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYwNTQ4NDkwLCJleHAiOjE3NjMxNDA0OTB9.6YbMRYN0LGKV9gKPEamxynd4TUbcX9iPHYED-oFfU_U";


    // Step 1: Fetch route from server to get exact departure/arrival times
    const routeResponse = await fetch('http://localhost:5000/api/routes/huye-kigali-001', {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const routeData = await routeResponse.json();
    if (!routeData.success || !routeData.data) {
      console.log('❌ Could not fetch route info');
      return;
    }

    const route = routeData.data;

    // Step 2: Construct booking payload using actual route info
    const bookingData = {
      routeId: route.id || route._id,
      route: {
        from: route.from,
        to: route.to,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime
      },
      passengers: [
        { name: "John Doe", age: 30, gender: "male", seatNumber: "SEAT-1" }
      ],
      totalAmount: route.price || 2500,
      paymentStatus: "pending",
      paymentId: "payment-123"
    };

    // Step 3: Send booking request
    const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(bookingData)
    });

    const bookingResult = await bookingResponse.json();

    if (bookingResult.success) {
      console.log('✅ Booking successful!');
      console.log(`📋 Booking ID: ${bookingResult.data.booking._id}`);
      console.log(`🎫 Tickets created: ${bookingResult.data.tickets.length}`);
    } else {
      console.log('❌ Booking failed:', bookingResult.message || bookingResult.errors);
    }

  } catch (error) {
    console.error('❌ Error testing booking:', error.message);
  }
}

testBooking();
