import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  from: string;
  to: string;
  agency: string;
  departureTime: string; // e.g., '12:00'
  arrivalTime: string;   // e.g., '18:00'
  price: number;
  availableSeats: number;
  busType: 'Standard' | 'Executive' | string;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema: Schema = new Schema(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    agency: { type: String, required: true, trim: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    busType: { type: String, required: true, default: 'Standard' },
  },
  { timestamps: true }
);

RouteSchema.index({ from: 1, to: 1 });

const RouteModel = mongoose.model<IRoute>('Route', RouteSchema);

export default RouteModel;


