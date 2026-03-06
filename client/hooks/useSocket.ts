import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTripStore } from '../store/useTripStore';

let socket: Socket | null = null;

export const getSocket = () => socket;

export const useSocket = (tripId: string | undefined) => {
    const {
        currentUser,
        setConnectionStatus,
        addItem,
        deleteItem,
        toggleItem,
        assignItem,
        addMember
    } = useTripStore();

    useEffect(() => {
        if (!tripId || !currentUser) return;

        // Connect to server
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
        socket = io(serverUrl);

        socket.on('connect', () => {
            setConnectionStatus(true);
            // Join the trip room
            socket?.emit('join_trip', {
                tripId,
                memberName: currentUser.name,
                memberId: currentUser.memberId
            });
        });

        socket.on('disconnect', () => {
            setConnectionStatus(false);
        });

        // Listeners
        socket.on('member_joined', (data: { memberId: string, memberName: string }) => {
            addMember({
                memberId: data.memberId,
                name: data.memberName,
                role: 'member'
            });
            // Optionally could trigger a toast notification here, but we'll do it from components for cleaner UX.
        });

        socket.on('item_added', (item) => {
            addItem(item);
        });

        socket.on('item_deleted', ({ itemId }) => {
            deleteItem(itemId);
        });

        socket.on('item_checked', ({ itemId, checked, memberId }) => {
            toggleItem(itemId, checked, checked ? memberId : null);
        });

        socket.on('item_assigned', ({ itemId, assigneeId }) => {
            assignItem(itemId, assigneeId);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [tripId, currentUser, setConnectionStatus, addItem, deleteItem, toggleItem, assignItem, addMember]);

    return { socket };
};
