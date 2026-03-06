import { Trip } from '../models/Trip.js';
import crypto from 'crypto';

export const setupSocketEvents = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a specific trip room
        socket.on('join_trip', async ({ tripId, memberName, memberId }) => {
            socket.join(tripId);
            console.log(`User ${memberName} (${memberId}) joined trip ${tripId}`);

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

                trip.items.push(newItem);
                await trip.save();

                io.to(tripId).emit('item_added', newItem);
            } catch (err) {
                console.error('Error adding item socket:', err);
            }
        });

        // Delete an item
        socket.on('delete_item', async ({ tripId, itemId }) => {
            try {
                const trip = await Trip.findOne({ tripId });
                if (!trip) return;

                trip.items = trip.items.filter(i => i.itemId !== itemId);
                await trip.save();

                io.to(tripId).emit('item_deleted', { itemId });
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
                    item.checked = checked;
                    item.checkedBy = checked ? memberId : null;
                    await trip.save();

                    io.to(tripId).emit('item_checked', {
                        itemId,
                        checked,
                        memberName,
                        memberId
                    });
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
                    item.assignedTo = assigneeId;
                    await trip.save();

                    io.to(tripId).emit('item_assigned', {
                        itemId,
                        assigneeId,
                        assigneeName
                    });
                }
            } catch (err) {
                console.error('Error assigning item socket:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
