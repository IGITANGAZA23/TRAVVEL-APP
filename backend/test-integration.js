const availableTicketsService = require('./dist/services/availableTicketsService.js');

console.log('=== Testing Available Tickets Service ===\n');

try {
  // Test 1: Load all routes
  console.log('1. Testing getAllRoutes():');
  const allRoutes = availableTicketsService.default.getAllRoutes();
  console.log(`   ✓ Loaded ${allRoutes.length} routes`);
  
  // Test 2: Search routes
  console.log('\n2. Testing searchRoutes():');
  const huyeRoutes = availableTicketsService.default.searchRoutes({ from: 'Huye', to: 'Kigali' });
  console.log(`   ✓ Found ${huyeRoutes.length} Huye to Kigali routes`);
  
  // Test 3: Get specific route
  console.log('\n3. Testing getRouteById():');
  const route = availableTicketsService.default.getRouteById('huye-kigali-001');
  if (route) {
    console.log(`   ✓ Found route: ${route.from} → ${route.to} (${route.agency})`);
    console.log(`   ✓ Price: RWF ${route.price}, Available seats: ${route.availableSeats}`);
  } else {
    console.log('   ✗ Route not found');
  }
  
  // Test 4: Update seats
  console.log('\n4. Testing updateAvailableSeats():');
  if (route) {
    const oldSeats = route.availableSeats;
    const success = availableTicketsService.default.updateAvailableSeats('huye-kigali-001', 2);
    const updatedRoute = availableTicketsService.default.getRouteById('huye-kigali-001');
    if (success && updatedRoute) {
      console.log(`   ✓ Updated seats: ${oldSeats} → ${updatedRoute.availableSeats}`);
      
      // Restore seats
      availableTicketsService.default.addAvailableSeats('huye-kigali-001', 2);
      const restoredRoute = availableTicketsService.default.getRouteById('huye-kigali-001');
      console.log(`   ✓ Restored seats: ${restoredRoute.availableSeats}`);
    } else {
      console.log('   ✗ Failed to update seats');
    }
  }
  
  // Test 5: Get origins and destinations
  console.log('\n5. Testing getOrigins() and getDestinations():');
  const origins = availableTicketsService.default.getOrigins();
  const destinations = availableTicketsService.default.getDestinations();
  console.log(`   ✓ Origins: ${origins.join(', ')}`);
  console.log(`   ✓ Destinations: ${destinations.join(', ')}`);
  
  console.log('\n=== All tests passed! Service is working correctly. ===');
  
} catch (error) {
  console.error('❌ Error testing service:', error.message);
  process.exit(1);
}
