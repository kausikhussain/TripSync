"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useTripStore } from "@/store/useTripStore"

export default function CreateTripPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { setTrip, setCurrentUser } = useTripStore()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        tripName: "",
        adminName: "",
        startDate: "",
        endDate: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!formData.tripName || !formData.adminName || !formData.startDate || !formData.endDate) {
            toast({
                title: "Missing Information",
                description: "Please fill out all fields to create your trip.",
                variant: "destructive"
            })
            return
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            toast({
                title: "Invalid Dates",
                description: "End date cannot be before the start date.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)

        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://tripsync-ubtj.onrender.com'
            const response = await fetch(`${serverUrl}/api/trip/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create trip')
            }

            // Success
            setTrip(data.trip)
            setCurrentUser({
                memberId: data.memberId,
                name: data.name,
                role: data.role
            })

            toast({
                title: "Trip Created! 🎉",
                description: `Your trip ID is ${data.trip.tripId}. Ready to start packing?`,
                variant: "success"
            })

            router.push(`/trip/${data.trip.tripId}`)

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong server-side.",
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
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-indigo-500/10 to-transparent rounded-full blur-3xl opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <Card className="shadow-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold tracking-tight text-center">Create a Trip</CardTitle>
                        <CardDescription className="text-center">
                            Set up your destination and dates to get started.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tripName">Trip Title / Destination</Label>
                                <Input
                                    id="tripName"
                                    name="tripName"
                                    placeholder="e.g. Summer in Bali 🌴"
                                    value={formData.tripName}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-slate-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adminName">Your Name</Label>
                                <Input
                                    id="adminName"
                                    name="adminName"
                                    placeholder="e.g. Rahul"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    className="bg-white dark:bg-slate-950"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="startDate"
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="bg-white dark:bg-slate-950 pl-10"
                                        />
                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="endDate"
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="bg-white dark:bg-slate-950 pl-10"
                                        />
                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full text-base h-11" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? "Creating..." : "Generate Trip Workspace"}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Already have a trip ID? <a href="/join" className="text-primary hover:underline font-medium">Join instead</a>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
