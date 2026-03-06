import { create } from 'zustand';

export interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
}

interface ToastStore {
    toasts: Toast[];
    toast: (options: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    toast: (options) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, ...options }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 5000); // auto dismiss after 5 seconds
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
