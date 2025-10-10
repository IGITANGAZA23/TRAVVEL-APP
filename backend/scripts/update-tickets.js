#!/usr/bin/env node

/**
 * Admin script to update available tickets data
 * Usage: node scripts/update-tickets.js [command] [options]
 * 
 * Commands:
 *   list                    - List all available routes
 *   update-seats <id> <seats> - Update available seats for a route
 *   add-route <json>        - Add a new route
 *   remove-route <id>       - Remove a route
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'available-tickets', 'rwanda-routes.json');

function loadData() {
  try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading data:', error.message);
    process.exit(1);
  }
}

function saveData(data) {
  try {
    data.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error.message);
    process.exit(1);
  }
}

function listRoutes() {
  const data = loadData();
  console.log('\n=== Available Routes ===');
  console.log(`Total routes: ${data.routes.length}`);
  console.log(`Last updated: ${data.metadata.lastUpdated}\n`);
  
  data.routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.id}`);
    console.log(`   ${route.from} → ${route.to}`);
    console.log(`   Agency: ${route.agency}`);
    console.log(`   Departure: ${route.departureTime} | Arrival: ${route.arrivalTime}`);
    console.log(`   Price: RWF ${route.price.toLocaleString()}`);
    console.log(`   Available seats: ${route.availableSeats}`);
    console.log(`   Bus type: ${route.busType}\n`);
  });
}

function updateSeats(routeId, newSeats) {
  const data = loadData();
  const route = data.routes.find(r => r.id === routeId);
  
  if (!route) {
    console.error(`Route with ID "${routeId}" not found`);
    process.exit(1);
  }
  
  const oldSeats = route.availableSeats;
  route.availableSeats = parseInt(newSeats);
  
  saveData(data);
  console.log(`Updated seats for route "${routeId}": ${oldSeats} → ${route.availableSeats}`);
}

function addRoute(routeJson) {
  const data = loadData();
  let newRoute;
  
  try {
    newRoute = JSON.parse(routeJson);
  } catch (error) {
    console.error('Invalid JSON format for new route');
    process.exit(1);
  }
  
  // Generate ID if not provided
  if (!newRoute.id) {
    newRoute.id = `${newRoute.from.toLowerCase()}-${newRoute.to.toLowerCase()}-${Date.now()}`;
  }
  
  // Validate required fields
  const requiredFields = ['from', 'to', 'agency', 'departureTime', 'arrivalTime', 'price', 'availableSeats', 'busType'];
  for (const field of requiredFields) {
    if (!newRoute[field]) {
      console.error(`Missing required field: ${field}`);
      process.exit(1);
    }
  }
  
  // Set default values
  newRoute.routeType = newRoute.routeType || 'intercity';
  newRoute.duration = newRoute.duration || '2 hours';
  newRoute.departureDays = newRoute.departureDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  data.routes.push(newRoute);
  data.metadata.totalRoutes = data.routes.length;
  
  saveData(data);
  console.log(`Added new route: ${newRoute.id}`);
}

function removeRoute(routeId) {
  const data = loadData();
  const routeIndex = data.routes.findIndex(r => r.id === routeId);
  
  if (routeIndex === -1) {
    console.error(`Route with ID "${routeId}" not found`);
    process.exit(1);
  }
  
  const removedRoute = data.routes.splice(routeIndex, 1)[0];
  data.metadata.totalRoutes = data.routes.length;
  
  saveData(data);
  console.log(`Removed route: ${removedRoute.id} (${removedRoute.from} → ${removedRoute.to})`);
}

function showHelp() {
  console.log(`
Available Tickets Management Script

Usage: node scripts/update-tickets.js [command] [options]

Commands:
  list                           List all available routes
  update-seats <id> <seats>      Update available seats for a route
  add-route <json>               Add a new route (JSON format)
  remove-route <id>              Remove a route by ID
  help                           Show this help message

Examples:
  node scripts/update-tickets.js list
  node scripts/update-tickets.js update-seats huye-kigali-001 25
  node scripts/update-tickets.js add-route '{"from":"Kigali","to":"Gisenyi","agency":"Ritco Ltd","departureTime":"10:00","arrivalTime":"14:00","price":4500,"availableSeats":30,"busType":"Executive"}'
  node scripts/update-tickets.js remove-route huye-kigali-001
`);
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'list':
    listRoutes();
    break;
  case 'update-seats':
    if (process.argv.length < 5) {
      console.error('Usage: update-seats <route-id> <new-seats>');
      process.exit(1);
    }
    updateSeats(process.argv[3], process.argv[4]);
    break;
  case 'add-route':
    if (process.argv.length < 4) {
      console.error('Usage: add-route <json-string>');
      process.exit(1);
    }
    addRoute(process.argv[3]);
    break;
  case 'remove-route':
    if (process.argv.length < 4) {
      console.error('Usage: remove-route <route-id>');
      process.exit(1);
    }
    removeRoute(process.argv[3]);
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${command || 'none'}`);
    showHelp();
    process.exit(1);
}
