import { create } from 'zustand';
import { Trip, Member, Item } from '../types';

interface TripState {
    currentTrip: Trip | null;
    currentUser: Member | null;
    isConnected: boolean;

    // Actions
    setTrip: (trip: Trip) => void;
    setCurrentUser: (member: Member) => void;
    setConnectionStatus: (status: boolean) => void;

    // Real-time updates
    addItem: (item: Item) => void;
    deleteItem: (itemId: string) => void;
    toggleItem: (itemId: string, checked: boolean, checkedBy: string | null) => void;
    assignItem: (itemId: string, assigneeId: string | null) => void;
    addMember: (member: Member) => void;

    // Reset
    clearTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
    currentTrip: null,
    currentUser: null,
    isConnected: false,

    setTrip: (trip) => set({ currentTrip: trip }),
    setCurrentUser: (member) => set({ currentUser: member }),
    setConnectionStatus: (status) => set({ isConnected: status }),

    addItem: (item) => set((state) => {
        if (!state.currentTrip) return state;
        // Prevent duplicates
        if (state.currentTrip.items.find(i => i.itemId === item.itemId)) return state;
        return {
            currentTrip: {
                ...state.currentTrip,
                items: [...state.currentTrip.items, item]
            }
        };
    }),

    deleteItem: (itemId) => set((state) => {
        if (!state.currentTrip) return state;
        return {
            currentTrip: {
                ...state.currentTrip,
                items: state.currentTrip.items.filter(i => i.itemId !== itemId)
            }
        };
    }),

    toggleItem: (itemId, checked, checkedBy) => set((state) => {
        if (!state.currentTrip) return state;
        return {
            currentTrip: {
                ...state.currentTrip,
                items: state.currentTrip.items.map(item =>
                    item.itemId === itemId
                        ? { ...item, checked, checkedBy }
                        : item
                )
            }
        };
    }),

    assignItem: (itemId, assigneeId) => set((state) => {
        if (!state.currentTrip) return state;
        return {
            currentTrip: {
                ...state.currentTrip,
                items: state.currentTrip.items.map(item =>
                    item.itemId === itemId
                        ? { ...item, assignedTo: assigneeId }
                        : item
                )
            }
        };
    }),

    addMember: (member) => set((state) => {
        if (!state.currentTrip) return state;
        // Prevent duplicates
        if (state.currentTrip.members.find(m => m.memberId === member.memberId)) return state;
        return {
            currentTrip: {
                ...state.currentTrip,
                members: [...state.currentTrip.members, member]
            }
        };
    }),

    clearTrip: () => set({ currentTrip: null, currentUser: null, isConnected: false })
}));
