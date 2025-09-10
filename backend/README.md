# TRAVVEL Backend

This is the backend for the TRAVVEL travel application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization (JWT)
- Role-based access control (User, Admin)
- Booking management
- Ticket generation and validation
- Appeal system for customer support
- RESTful API design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TRAVVEL/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env` with your configuration

4. **Database Setup**
   - For local development, install MongoDB Community Edition or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` with your MongoDB connection string

5. **Running the Application**
   - Development mode (with hot-reload):
     ```bash
     npm run dev
     # or
     yarn dev
     ```
   - Production build:
     ```bash
     npm run build
     npm start
     # or
     yarn build
     yarn start
     ```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`
- API Base URL: `http://localhost:5000/api`

## Available Scripts

- `dev`: Start development server with hot-reload
- `build`: Compile TypeScript to JavaScript
- `start`: Start production server
- `test`: Run tests
- `lint`: Run ESLint
- `format`: Format code with Prettier

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Application environment (development, production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_EXPIRE` - JWT expiration time (e.g., 30d)
- `JWT_COOKIE_EXPIRE` - JWT cookie expiration in days
- `FRONTEND_URL` - Frontend URL for CORS

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Bookings
- `GET /api/bookings` - Get all bookings for current user
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Tickets
- `GET /api/tickets` - Get all tickets for current user
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id/status` - Update ticket status
- `GET /api/tickets/verify/:ticketNumber` - Verify ticket (staff/admin only)

### Appeals
- `GET /api/appeals` - Get all appeals for current user
- `GET /api/appeals/:id` - Get appeal by ID
- `POST /api/appeals` - Create a new appeal
- `GET /api/appeals/admin/all` - Get all appeals (admin only)
- `PUT /api/appeals/:id` - Update appeal (admin only)

## Testing

To run tests:
```bash
npm test
# or
yarn test
```

## Deployment

1. Set up a production MongoDB database (MongoDB Atlas recommended)
2. Update environment variables in production
3. Build the application: `npm run build`
4. Start the server: `npm start`

For production deployment, consider using:
- PM2 for process management
- Nginx as a reverse proxy
- Let's Encrypt for SSL certificates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
