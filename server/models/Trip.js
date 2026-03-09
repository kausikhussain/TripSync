import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true, default: 'Essentials' },
    checked: { type: Boolean, default: false },
    category: { type: String, default: 'Essentials' },
    addedBy: { type: String, required: true },
    checked: { type: Boolean, default: false },
    checkedBy: { type: String, default: null }, // memberId who checked it
    assignedTo: { type: String, default: null } // memberId
}, { _id: false });

const memberSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
    expenseId: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true }, // memberId
    date: { type: Date, default: Date.now },
}, { _id: false });

const activitySchema = new mongoose.Schema({
    activityId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const tripSchema = new mongoose.Schema({
    tripId: { type: String, required: true, unique: true },
    tripName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    creatorId: { type: String, required: true }, // memberId of admin
    members: [memberSchema],
    items: [itemSchema],
    expenses: [expenseSchema],
    activities: [activitySchema]
}, { timestamps: true });

export const Trip = mongoose.model('Trip', tripSchema);
