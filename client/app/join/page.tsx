"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useTripStore } from "@/store/useTripStore"

export default function JoinTripPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { setTrip, setCurrentUser } = useTripStore()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        tripId: "",
        memberName: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.tripId || !formData.memberName) {
            toast({
                title: "Missing Information",
                description: "Please enter both the Trip ID and your name.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)

        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
            const response = await fetch(`${serverUrl}/api/trip/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join trip')
            }

            // Success
            setTrip(data.trip)
            setCurrentUser({
                memberId: data.memberId,
                name: data.name,
                role: data.role
            })

            toast({
                title: "Joined Successfully! 🎉",
                description: `Welcome to ${data.trip.tripName}`,
                variant: "success"
            })

            router.push(`/trip/${data.trip.tripId}`)

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Could not join trip. Check your ID.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            {/* Decorative bg */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply flex-none"></div>
                <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-50 mix-blend-multiply flex-none"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <Card className="shadow-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-center">Join a Tryp</CardTitle>
                        <CardDescription className="text-center">
                            Enter the unique Trip ID shared by the planner.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tripId">Trip ID</Label>
                                <Input
                                    id="tripId"
                                    name="tripId"
                                    placeholder="e.g. 8A3F9B"
                                    value={formData.tripId}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-slate-950 font-mono text-center tracking-widest uppercase"
                                    maxLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="memberName">Your Name</Label>
                                <Input
                                    id="memberName"
                                    name="memberName"
                                    placeholder="e.g. Aman"
                                    value={formData.memberName}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-slate-950"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full text-base h-11" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? "Joining..." : "Join Group"}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Don't have a trip yet? <a href="/create" className="text-primary hover:underline font-medium">Create one</a>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
