import mongoose, { Document, Schema } from 'mongoose';

interface IAppeal extends Document {
  user: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  response?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppealSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
      trim: true,
      maxlength: [100, 'Subject cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'rejected'],
      default: 'pending',
    },
    response: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot be more than 1000 characters'],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
AppealSchema.index({ user: 1, status: 1 });
AppealSchema.index({ ticket: 1 });
AppealSchema.index({ status: 1 });

const Appeal = mongoose.model<IAppeal>('Appeal', AppealSchema);

export default Appeal;
