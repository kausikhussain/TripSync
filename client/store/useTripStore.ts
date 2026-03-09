import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip, Member, Item, Expense, Activity } from '../types';

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
    addExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
    addActivity: (activity: Activity) => void;

    // Reset
    clearTrip: () => void;
}

export const useTripStore = create<TripState>()(
    persist(
        (set) => ({
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

            addExpense: (expense) => set((state) => {
                if (!state.currentTrip) return state;
                if (state.currentTrip.expenses?.find(e => e.expenseId === expense.expenseId)) return state;
                return {
                    currentTrip: {
                        ...state.currentTrip,
                        expenses: [...(state.currentTrip.expenses || []), expense]
                    }
                };
            }),

            deleteExpense: (expenseId) => set((state) => {
                if (!state.currentTrip) return state;
                return {
                    currentTrip: {
                        ...state.currentTrip,
                        expenses: (state.currentTrip.expenses || []).filter(e => e.expenseId !== expenseId)
                    }
                };
            }),

            addActivity: (activity) => set((state) => {
                if (!state.currentTrip) return state;
                if (state.currentTrip.activities?.find(a => a.activityId === activity.activityId)) return state;
                return {
                    currentTrip: {
                        ...state.currentTrip,
                        activities: [activity, ...(state.currentTrip.activities || [])]
                    }
                };
            }),

            clearTrip: () => set({ currentTrip: null, currentUser: null, isConnected: false })
        }),
        {
            name: 'tripsync-storage',
            partialize: (state) => ({ currentTrip: state.currentTrip, currentUser: state.currentUser }),
        }
    )
);
