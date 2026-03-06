"use client"

import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                            "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all mb-4",
                            toast.variant === "destructive"
                                ? "destructive group border-destructive bg-destructive text-destructive-foreground"
                                : toast.variant === "success"
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border bg-background text-foreground"
                        )}
                    >
                        <div className="grid gap-1">
                            {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
                            {toast.description && (
                                <div className="text-sm opacity-90">{toast.description}</div>
                            )}
                        </div>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
