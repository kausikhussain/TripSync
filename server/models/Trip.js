import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true, default: 'Essentials' },
    checked: { type: Boolean, default: false },
    addedBy: { type: String, required: true },
    assignedTo: { type: String, default: null },
    checkedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
    tripId: { type: String, required: true, unique: true, index: true },
    tripName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: String, required: true }, // memberId of admin
    members: [memberSchema],
    items: [itemSchema],
    createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.model('Trip', tripSchema);
