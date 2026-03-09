import { Trip } from '../models/Trip.js';
import crypto from 'crypto';

// Helper to add activity
const logActivity = async (trip, text) => {
    const newActivity = {
        activityId: `act_${crypto.randomUUID().slice(0, 8)}`,
        text,
        timestamp: new Date()
    };
    trip.activities.unshift(newActivity);
    if (trip.activities.length > 100) trip.activities.pop(); // keep last 100
    return newActivity;
};

export const setupSocketEvents = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific trip room
        socket.on('join_trip', async ({ tripId, memberName, memberId }) => {
            socket.join(tripId);
            console.log(`User ${memberName} (${memberId}) joined trip ${tripId}`);

            try {
                const trip = await Trip.findOne({ tripId });
                if (trip) {
                    const act = await logActivity(trip, `${memberName} joined the trip.`);
                    await trip.save();
                    io.to(tripId).emit('activity_logged', act);
                }
            } catch (e) { }

            // Notify others in the room
            socket.to(tripId).emit('member_joined', { memberName, memberId });
        });

        // Add an item
        socket.on('add_item', async ({ tripId, itemName, category, addedBy }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const newItem = {
                    itemId: `item_${crypto.randomUUID().slice(0, 8)}`,
                    itemName,
                    category: category || 'Essentials',
                    addedBy,
                    checked: false,
                    assignedTo: null,
                    checkedBy: null,
                    createdAt: new Date()
                };

                const act = await logActivity(trip, `${addedBy} added a new item: ${itemName}`);
                trip.items.push(newItem);
                await trip.save();

                io.to(tripId).emit('item_added', newItem);
                io.to(tripId).emit('activity_logged', act);
            } catch (err) {
                console.error('Error adding item socket:', err);
            }
        });

        // Delete an item
        socket.on('delete_item', async ({ tripId, itemId }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const item = trip.items.find(i => i.itemId === itemId);
                if (item) {
                    const act = await logActivity(trip, `An item was deleted: ${item.itemName}`);
                    trip.items = trip.items.filter(i => i.itemId !== itemId);
                    await trip.save();

                    io.to(tripId).emit('item_deleted', { itemId });
                    io.to(tripId).emit('activity_logged', act);
                }
            } catch (err) {
                console.error('Error deleting item socket:', err);
            }
        });

        // Toggle item checked status
        socket.on('toggle_item', async ({ tripId, itemId, checked, memberName, memberId }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const item = trip.items.find(i => i.itemId === itemId);
                if (item) {
                    const action = checked ? `checked off` : `un-checked`;
                    const act = await logActivity(trip, `${memberName} ${action} ${item.itemName}`);
                    item.checked = checked;
                    item.checkedBy = checked ? memberId : null;
                    await trip.save();

                    io.to(tripId).emit('item_checked', {
                        itemId,
                        checked,
                        memberName,
                        memberId
                    });
                    io.to(tripId).emit('activity_logged', act);
                }
            } catch (err) {
                console.error('Error toggling item socket:', err);
            }
        });

        // Assign item
        socket.on('assign_item', async ({ tripId, itemId, assigneeId, assigneeName }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const item = trip.items.find(i => i.itemId === itemId);
                if (item) {
                    const act = await logActivity(trip, `${assigneeName || 'Someone'} was assigned to ${item.itemName}`);
                    item.assignedTo = assigneeId;
                    await trip.save();

                    io.to(tripId).emit('item_assigned', {
                        itemId,
                        assigneeId,
                        assigneeName
                    });
                    io.to(tripId).emit('activity_logged', act);
                }
            } catch (err) {
                console.error('Error assigning item socket:', err);
            }
        });

        // Add an expense
        socket.on('add_expense', async ({ tripId, description, amount, paidBy, memberName }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const newExpense = {
                    expenseId: `exp_${crypto.randomUUID().slice(0, 8)}`,
                    description,
                    amount: Number(amount),
                    paidBy, // this is memberId
                    date: new Date()
                };

                const act = await logActivity(trip, `${memberName} added an expense: $${amount} for ${description}`);
                trip.expenses.push(newExpense);
                await trip.save();

                io.to(tripId).emit('expense_added', newExpense);
                io.to(tripId).emit('activity_logged', act);
            } catch (err) {
                console.error('Error adding expense:', err);
            }
        });

        // Delete an expense
        socket.on('delete_expense', async ({ tripId, expenseId, memberName }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                const expense = trip.expenses.find(e => e.expenseId === expenseId);
                if (expense) {
                    const act = await logActivity(trip, `${memberName} deleted an expense: ${expense.description}`);
                    trip.expenses = trip.expenses.filter(e => e.expenseId !== expenseId);
                    await trip.save();

                    io.to(tripId).emit('expense_deleted', { expenseId });
                    io.to(tripId).emit('activity_logged', act);
                }
            } catch (err) {
                console.error('Error deleting expense:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
