"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Ticket',
        }],
}, {
    timestamps: true,
});
// Add index for better query performance
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ 'route.departureTime': 1 });
const Booking = mongoose_1.default.model('Booking', BookingSchema);
exports.default = Booking;
