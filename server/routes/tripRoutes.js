import express from 'express';
import { Trip } from '../models/Trip.js';
import crypto from 'crypto';

const router = express.Router();

// Generate a random 6-character alphanumeric code
const generateTripId = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// 1. Create a Trip
router.post('/create', async (req, res) => {
    try {
        const { tripName, startDate, endDate, adminName } = req.body;

        if (!tripName || !startDate || !endDate || !adminName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tripId = generateTripId();
        const adminId = `mem_${crypto.randomUUID().slice(0, 8)}`;

        const newTrip = new Trip({
            tripId,
            tripName,
            startDate,
            endDate,
            creatorId: adminId,
            members: [{
                memberId: adminId,
                name: adminName,
                role: 'admin'
            }],
            items: []
        });

        await newTrip.save();

        res.status(201).json({
            success: true,
            trip: newTrip,
            memberId: adminId,
            role: 'admin',
            name: adminName
        });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ error: 'Server error creating trip' });
    }
});

// 2. Join a Trip
router.post('/join', async (req, res) => {
    try {
        const { tripId, memberName } = req.body;

        if (!tripId || !memberName) {
            return res.status(400).json({ error: 'Missing tripId or memberName' });
        }

        const trip = await Trip.findOne({ tripId: tripId.toUpperCase() });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Check if member name already exists to prevent confusion (simple check)
        if (trip.members.some(m => m.name.toLowerCase() === memberName.toLowerCase())) {
            return res.status(400).json({ error: 'Name already taken in this trip' });
        }

        const memberId = `mem_${crypto.randomUUID().slice(0, 8)}`;
        const newMember = {
            memberId,
            name: memberName,
            role: 'member'
        };

        trip.members.push(newMember);
        await trip.save();

        res.status(200).json({
            success: true,
            trip,
            memberId,
            role: 'member',
            name: memberName
        });
    } catch (error) {
        console.error('Join trip error:', error);
        res.status(500).json({ error: 'Server error joining trip' });
    }
});

// 3. Get Trip Details
router.get('/:tripId', async (req, res) => {
    try {
        const trip = await Trip.findOne({ tripId: req.params.tripId.toUpperCase() });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        res.status(200).json({ success: true, trip });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching trip' });
    }
});

// 4. Delete Trip (Admin Only)
router.delete('/:tripId', async (req, res) => {
    try {
        const { memberId } = req.query; // Usually ideally in a token or header
        const trip = await Trip.findOne({ tripId: req.params.tripId.toUpperCase() });

        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        if (trip.creatorId !== memberId) {
            return res.status(403).json({ error: 'Only admin can delete trip' });
        }

        await Trip.deleteOne({ tripId: trip.tripId });
        res.status(200).json({ success: true, message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting trip' });
    }
});

export default router;
