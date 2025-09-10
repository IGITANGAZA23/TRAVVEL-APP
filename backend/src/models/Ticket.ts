import mongoose, { Document, Schema } from 'mongoose';

interface ITicket extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  ticketNumber: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled';
  journeyDetails: {
    from: string;
    to: string;
    departureTime: Date;
    arrivalTime: Date;
    seatNumber: string;
  };
  passenger: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
  };
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active',
    },
    journeyDetails: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      departureTime: {
        type: Date,
        required: true,
      },
      arrivalTime: {
        type: Date,
        required: true,
      },
      seatNumber: {
        type: String,
        required: true,
      },
    },
    passenger: {
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ ticketNumber: 1 }, { unique: true });
TicketSchema.index({ 'journeyDetails.departureTime': 1 });

const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
