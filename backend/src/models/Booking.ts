import mongoose, { Document, Schema } from 'mongoose';

interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  route: {
    from: string;
    to: string;
    departureTime: Date;
    arrivalTime: Date;
  };
  routeId?: string; // Reference to the route in available tickets
  passengers: Array<{
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    seatNumber: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  tickets?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    route: {
      from: {
        type: String,
        required: [true, 'Please add departure location'],
      },
      to: {
        type: String,
        required: [true, 'Please add destination'],
      },
      departureTime: {
        type: Date,
        required: [true, 'Please add departure time'],
      },
      arrivalTime: {
        type: Date,
        required: [true, 'Please add arrival time'],
      },
    },
    passengers: [
      {
        name: {
          type: String,
          required: [true, 'Please add passenger name'],
        },
        age: {
          type: Number,
          required: [true, 'Please add passenger age'],
        },
        gender: {
          type: String,
          enum: ['male', 'female', 'other'],
          required: [true, 'Please specify gender'],
        },
        seatNumber: {
          type: String,
          required: [true, 'Please add seat number'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Please add total amount'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    routeId: {
      type: String,
      required: false,
    },
    tickets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    }],
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ 'route.departureTime': 1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
