# Available Tickets System

This folder contains the data for available bus routes and tickets that can be modified day by day.

## File Structure

- `rwanda-routes.json` - Main data file containing all available routes
- `README.md` - This documentation file

## Data Format

The `rwanda-routes.json` file contains:

```json
{
  "routes": [
    {
      "id": "unique-route-id",
      "from": "Origin city",
      "to": "Destination city", 
      "agency": "Bus company name",
      "departureTime": "HH:MM format",
      "arrivalTime": "HH:MM format",
      "price": 2500,
      "availableSeats": 28,
      "busType": "Executive or Standard",
      "routeType": "intercity or local",
      "duration": "X hours",
      "departureDays": ["monday", "tuesday", ...]
    }
  ],
  "metadata": {
    "lastUpdated": "ISO timestamp",
    "totalRoutes": 12,
    "availableAgencies": ["Agency1", "Agency2"],
    "busTypes": ["Executive", "Standard"],
    "routeTypes": ["intercity", "local"]
  }
}
```

## Daily Management

### Using the Admin Script

The system includes an admin script to easily manage routes:

```bash
# List all routes
node scripts/update-tickets.js list

# Update available seats for a route
node scripts/update-tickets.js update-seats huye-kigali-001 25

# Add a new route
node scripts/update-tickets.js add-route '{"from":"Kigali","to":"Gisenyi","agency":"Ritco Ltd","departureTime":"10:00","arrivalTime":"14:00","price":4500,"availableSeats":30,"busType":"Executive"}'

# Remove a route
node scripts/update-tickets.js remove-route huye-kigali-001
```

### Manual Editing

You can also manually edit the `rwanda-routes.json` file:

1. **Update Available Seats**: Change the `availableSeats` field for routes as bookings are made
2. **Add New Routes**: Add new route objects to the `routes` array
3. **Remove Routes**: Remove route objects from the `routes` array
4. **Update Prices**: Modify the `price` field as needed
5. **Change Schedules**: Update `departureTime` and `arrivalTime` fields

## Current Routes

The system currently includes these popular Rwanda routes:

- **Huye ↔ Kigali**: Multiple daily services
- **Kigali ↔ Musanze**: Northern route to Volcanoes National Park
- **Kigali ↔ Rubavu**: Western route to Lake Kivu
- **Muhanga ↔ Huye**: Local Southern route
- **Kigali ↔ Nyagatare**: Eastern route
- **Kigali ↔ Karongi**: Western route
- **Kigali ↔ Bugesera**: Southern route

## API Integration

The available tickets system integrates with the backend API through:

- `GET /api/routes` - Get all available routes
- `GET /api/routes/search` - Search routes with filters
- `GET /api/routes/:id` - Get specific route by ID
- `GET /api/routes/from/:from/to/:to` - Get routes by origin/destination
- `GET /api/routes/origins` - Get all unique origins
- `GET /api/routes/destinations` - Get all unique destinations

## Booking Integration

When tickets are booked:

1. The system validates route availability
2. Available seats are reduced automatically
3. If booking is cancelled, seats are returned
4. Real-time seat availability is maintained

## Best Practices

1. **Regular Updates**: Update available seats at least twice daily
2. **Price Monitoring**: Adjust prices based on demand and season
3. **Schedule Accuracy**: Keep departure/arrival times current
4. **Backup Data**: Keep backups before major changes
5. **Validation**: Use the admin script for data validation

## Troubleshooting

- **File Not Found**: Ensure the JSON file exists and is readable
- **Invalid JSON**: Use a JSON validator before saving changes
- **API Errors**: Check server logs for data parsing issues
- **Booking Failures**: Verify seat availability before allowing bookings
