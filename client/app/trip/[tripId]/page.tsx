"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
    Users, CalendarIcon, Plus, Trash2, CheckCircle2,
    Circle, MapPin, Search, Copy, Check, Clock, ShieldCheck, Zap,
    Activity as ActivityIcon, DollarSign, Receipt, Download
} from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

import { QRCodeCanvas } from "qrcode.react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useTripStore } from "@/store/useTripStore"
import { useSocket, getSocket } from "@/hooks/useSocket"
import { useToast } from "@/hooks/use-toast"

export default function TripDashboard() {
    const params = useParams()
    const router = useRouter()
    const tripId = params.tripId as string
    const { toast } = useToast()

    const {
        currentTrip,
        currentUser,
        isConnected,
        setTrip,
        clearTrip
    } = useTripStore()

    // Initialize socket
    const { socket } = useSocket(currentTrip?.tripId)

    const [loading, setLoading] = useState(!currentTrip)
    const [copied, setCopied] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [newItemCategory, setNewItemCategory] = useState("Essentials")

    const [newExpenseDesc, setNewExpenseDesc] = useState("")
    const [newExpenseAmount, setNewExpenseAmount] = useState("")

    const categories = ["Clothes", "Electronics", "Essentials", "Documents"]

    // Fetch trip if not in store (direct URL hit)
    useEffect(() => {
        if (!currentUser) {
            toast({
                title: "Authentication Required",
                description: "Please join the trip to access the dashboard.",
                variant: "destructive"
            })
            router.push("/join")
            return
        }

        if (!currentTrip) {
            const fetchTrip = async () => {
                try {
                    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://tripsync-ubtj.onrender.com'
                    const res = await fetch(`${serverUrl}/api/trip/${tripId}`)
                    if (!res.ok) throw new Error("Trip not found")
                    const data = await res.json()
                    setTrip(data.trip)
                } catch (error) {
                    router.push("/join")
                } finally {
                    setLoading(false)
                }
            }
            fetchTrip()
        } else {
            setLoading(false)
        }
    }, [tripId, currentUser, currentTrip, setTrip, router, toast])

    const handleCopyId = () => {
        navigator.clipboard.writeText(tripId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
            title: "Copied!",
            description: "Trip ID copied to clipboard",
            variant: "default"
        })
    }

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newItemName.trim() || !currentUser) return

        const skt = getSocket()
        if (skt) {
            skt.emit('add_item', {
                tripId,
                itemName: newItemName.trim(),
                category: newItemCategory,
                addedBy: currentUser.name
            })
            setNewItemName("")
        }
    }

    const toggleItem = (itemId: string, currentStatus: boolean) => {
        if (!currentUser) return
        const skt = getSocket()
        if (skt) {
            skt.emit('toggle_item', {
                tripId,
                itemId,
                checked: !currentStatus,
                memberName: currentUser.name,
                memberId: currentUser.memberId
            })
        }
    }

    const deleteItem = (itemId: string) => {
        const skt = getSocket()
        if (skt) {
            skt.emit('delete_item', { tripId, itemId })
        }
    }

    const assignItem = (itemId: string, assigneeId: string | null, assigneeName: string | null) => {
        const skt = getSocket()
        if (skt) {
            skt.emit('assign_item', { tripId, itemId, assigneeId, assigneeName })
        }
    }

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newExpenseDesc.trim() || !newExpenseAmount || !currentUser) return

        const skt = getSocket()
        if (skt) {
            skt.emit('add_expense', {
                tripId,
                description: newExpenseDesc.trim(),
                amount: newExpenseAmount,
                paidBy: currentUser.memberId,
                memberName: currentUser.name
            })
            setNewExpenseDesc("")
            setNewExpenseAmount("")
        }
    }

    const handleDeleteExpense = (expenseId: string) => {
        if (!currentUser) return
        const skt = getSocket()
        if (skt) {
            skt.emit('delete_expense', { tripId, expenseId, memberName: currentUser.name })
        }
    }

    const logout = () => {
        clearTrip()
        router.push("/")
    }

    const handleExportPDF = async () => {
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('printable-dashboard');
        if (!element) return;

        // Add a temporary class to hide elements during print if needed
        const opt = {
            margin: 0.5,
            filename: `TripSync_${currentTrip?.tripName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };

        toast({
            title: "Exporting...",
            description: "Generating PDF report of your trip.",
        })

        html2pdf().set(opt).from(element).save();
    }

    // Derived state
    const totalItems = currentTrip?.items.length || 0
    const completedItems = currentTrip?.items.filter(i => i.checked).length || 0
    const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

    // Confetti Celebration!
    useEffect(() => {
        if (progressPercentage === 100 && totalItems > 0) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                toast({
                    title: "Trip Fully Packed! 🎉",
                    description: "Ready for takeoff! Have a great journey.",
                    variant: "success",
                })
            }, 1000);
        }
    }, [progressPercentage, totalItems, toast])

    if (loading || !currentTrip || !currentUser) {
        return (
            <div className="flex flex-col min-h-screen p-8 bg-slate-50 dark:bg-slate-950 max-w-7xl mx-auto space-y-8 mt-16">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    // Group items by category
    const groupedItems = categories.map(cat => ({
        category: cat,
        items: currentTrip.items.filter(i => i.category === cat)
    })).filter(g => g.items.length > 0)

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Clothes': return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800"
            case 'Electronics': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            case 'Documents': return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            default: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 pb-20">
            {/* Premium Header Profile Bar */}
            <div className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg hidden sm:block">TripSync Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="relative flex h-3 w-3">
                                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </span>
                            <span className="text-slate-500 hidden sm:block">{isConnected ? 'Live Sync Active' : 'Connecting...'}</span>
                        </div>
                        <div className="h-8 w-px bg-border"></div>
                        <ModeToggle />
                        <div className="flex items-center gap-2 ml-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium mr-2">{currentUser.name}</span>
                            <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 shadow-sm">
                                <Download className="h-4 w-4 mr-1" /> Export
                            </Button>
                            <Button variant="outline" size="sm" onClick={logout} className="h-8 shadow-sm ml-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 hidden sm:flex">Leave</Button>
                        </div>
                    </div>
                </div>
            </div>

            <main id="printable-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Main Header / Info Banner */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <MapPin className="h-64 w-64 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="px-3 py-1 font-mono text-sm uppercase tracking-widest shadow-sm">
                                    ID: {tripId}
                                    <button onClick={handleCopyId} className="ml-2 hover:text-foreground">
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </Badge>
                                {currentUser.role === 'admin' && (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 pb-0.5">
                                        <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                                {currentTrip.tripName}
                            </h1>
                            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                                <CalendarIcon className="mr-2 h-5 w-5" />
                                {format(new Date(currentTrip.startDate), "MMM d")} - {format(new Date(currentTrip.endDate), "MMM d, yyyy")}
                            </div>
                        </div>

                        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Packing Progress</span>
                                <span className="text-2xl font-bold">{progressPercentage}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2.5 mb-2" />
                            <p className="text-xs text-muted-foreground text-right">
                                {completedItems} of {totalItems} items packed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Interactive Workspace */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        <Tabs defaultValue="checklist" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900 border shadow-sm">
                                <TabsTrigger value="checklist" className="data-[state=active]:shadow-sm"><CheckCircle2 className="w-4 h-4 mr-2" /> Checklist</TabsTrigger>
                                <TabsTrigger value="finance" className="data-[state=active]:shadow-sm"><DollarSign className="w-4 h-4 mr-2" /> Expenses</TabsTrigger>
                                <TabsTrigger value="activity" className="data-[state=active]:shadow-sm"><ActivityIcon className="w-4 h-4 mr-2" /> Activity Feed</TabsTrigger>
                            </TabsList>

                            {/* CHECKLIST TAB */}
                            <TabsContent value="checklist" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-h-[800px] flex flex-col">
                                <Card className="shadow-sm border-slate-200 dark:border-slate-800 shrink-0">
                                    <CardContent className="p-4 sm:p-6">
                                        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="What do we need to pack? e.g. Phone Charger"
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    className="bg-slate-50 dark:bg-slate-950/50 border-transparent focus-visible:ring-primary shadow-inner h-12 text-base"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="h-12 rounded-md border border-input bg-slate-50 dark:bg-slate-950/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-inner"
                                                    value={newItemCategory}
                                                    onChange={(e) => setNewItemCategory(e.target.value)}
                                                >
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <Button type="submit" disabled={!newItemName.trim()} className="h-12 px-6 shadow-md">
                                                    <Plus className="mr-2 h-4 w-4" /> Add
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                <ScrollArea className="flex-1 pr-4 -mr-4 h-[600px]">
                                    <AnimatePresence>
                                        {currentTrip.items.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed rounded-3xl"
                                            >
                                                <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Plus className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-medium">List is empty</h3>
                                                <p className="text-muted-foreground mt-1">Start adding items you need for the trip.</p>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-8 pb-4">
                                                {groupedItems.map((group) => (
                                                    <div key={group.category} className="space-y-3">
                                                        <h3 className={cn("text-sm font-bold uppercase tracking-wider flex items-center gap-2", getCategoryColor(group.category).split(' ')[1])}>
                                                            <span className={cn("inline-block w-2.5 h-2.5 rounded-full", getCategoryColor(group.category).split(' ')[0])}></span>
                                                            {group.category} <span className="text-muted-foreground text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">{group.items.length}</span>
                                                        </h3>
                                                        <div className="grid gap-3">
                                                            {group.items.map((item) => (
                                                                <motion.div
                                                                    key={item.itemId}
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                                    className={cn(
                                                                        "group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all hover:shadow-md",
                                                                        item.checked && "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75"
                                                                    )}
                                                                >
                                                                    <Checkbox
                                                                        checked={item.checked}
                                                                        onCheckedChange={() => toggleItem(item.itemId, item.checked)}
                                                                        className="h-6 w-6 rounded-full border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-colors"
                                                                    />

                                                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
                                                                        <div className={cn("text-base font-semibold truncate transition-all", item.checked && "line-through text-slate-400")}>
                                                                            {item.itemName}
                                                                        </div>

                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                            <div className="flex items-center text-xs text-muted-foreground mr-2">
                                                                                <span className="hidden md:inline">Added by&nbsp;</span>
                                                                                <strong className="font-medium text-slate-700 dark:text-slate-300">{item.addedBy}</strong>
                                                                            </div>

                                                                            {item.assignedTo ? (
                                                                                <div className="flex -space-x-2 mr-2">
                                                                                    <div className="h-6 w-6 rounded-full border-2 border-background bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold" title={`Assigned to ${currentTrip.members.find(m => m.memberId === item.assignedTo)?.name || 'Unknown'}`}>
                                                                                        {(currentTrip.members.find(m => m.memberId === item.assignedTo)?.name || '?').charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 text-xs px-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    onClick={() => assignItem(item.itemId, currentUser.memberId, currentUser.name)}
                                                                                >
                                                                                    Claim
                                                                                </Button>
                                                                            )}

                                                                            {(currentUser.role === 'admin' || item.addedBy === currentUser.name) && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                                                    onClick={() => deleteItem(item.itemId)}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </ScrollArea>
                            </TabsContent>

                            {/* EXPENSES TAB */}
                            <TabsContent value="finance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                                    <CardContent className="p-4 sm:p-6">
                                        <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="What did we pay for? e.g. Dinner"
                                                    value={newExpenseDesc}
                                                    onChange={(e) => setNewExpenseDesc(e.target.value)}
                                                    className="bg-slate-50 dark:bg-slate-950/50 border-transparent focus-visible:ring-primary shadow-inner h-12 text-base"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={newExpenseAmount}
                                                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                                                        className="pl-7 bg-slate-50 dark:bg-slate-950/50 border-transparent focus-visible:ring-primary shadow-inner h-12 w-28 text-base"
                                                    />
                                                </div>
                                                <Button type="submit" disabled={!newExpenseDesc.trim() || !newExpenseAmount} className="h-12 px-6 shadow-md">
                                                    <Plus className="mr-2 h-4 w-4" /> Log
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                                    {!currentTrip.expenses || currentTrip.expenses.length === 0 ? (
                                        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed rounded-3xl">
                                            <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Receipt className="h-8 w-8 text-amber-500" />
                                            </div>
                                            <h3 className="text-lg font-medium">No expenses yet</h3>
                                            <p className="text-muted-foreground mt-1">Keep track of who paid for what.</p>
                                        </div>
                                    ) : (
                                        currentTrip.expenses.map((expense) => {
                                            const payer = currentTrip.members.find(m => m.memberId === expense.paidBy)?.name || 'Unknown'
                                            return (
                                                <motion.div
                                                    key={expense.expenseId}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-base">{expense.description}</p>
                                                            <p className="text-xs text-muted-foreground">Paid by <strong className="text-foreground">{payer}</strong> on {format(new Date(expense.date), "MMM d")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-extrabold text-lg">${Number(expense.amount).toFixed(2)}</span>
                                                        {(currentUser.role === 'admin' || expense.paidBy === currentUser.memberId) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleDeleteExpense(expense.expenseId)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    )}
                                </div>
                            </TabsContent>

                            {/* ACTIVITY LOG TAB */}
                            <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-indigo-500" /> Recent Activity
                                </h3>
                                <div className="space-y-6 pl-2 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:via-indigo-100 before:to-transparent dark:before:from-indigo-900 dark:before:via-indigo-900">
                                    {!currentTrip.activities || currentTrip.activities.length === 0 ? (
                                        <p className="text-muted-foreground text-sm ml-6">No activity recorded yet.</p>
                                    ) : (
                                        currentTrip.activities.map((act) => (
                                            <motion.div
                                                key={act.activityId}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="relative flex items-center gap-6"
                                            >
                                                <div className="absolute left-0 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                                                <div className="flex-1 ml-6 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border shadow-sm">
                                                    <p className="text-sm font-medium">{act.text}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(act.timestamp), "MMM d, h:mm a")}</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                    </div>

                    {/* Right Column: Members panel */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                                    <Users className="h-5 w-5 text-indigo-500" /> Travelers ({currentTrip.members.length})
                                </h3>
                                <div className="space-y-4">
                                    {currentTrip.members.map((member) => (
                                        <div key={member.memberId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-sm relative",
                                                    member.role === 'admin' ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                                                )}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                    {/* Online indicator mock (everyone listed could be online or assumed online for simplicity) */}
                                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{member.name} {member.memberId === currentUser.memberId && "(You)"}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t border-dashed mt-4 grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="w-full" onClick={handleCopyId}>
                                            <Copy className="h-4 w-4 mr-2" /> Copy ID
                                        </Button>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    <Plus className="h-4 w-4 mr-2" /> Invite QR
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md text-center flex flex-col items-center p-8 bg-white dark:bg-slate-950">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold">Invite Travelers</DialogTitle>
                                                    <DialogDescription>
                                                        Scan this code to instantly join {currentTrip.tripName}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="bg-white p-4 rounded-xl shadow-inner border my-6">
                                                    <QRCodeCanvas
                                                        value={`${window.location.origin}/join?id=${tripId}`}
                                                        size={200}
                                                        level={"H"}
                                                        imageSettings={{
                                                            src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L2.5 8l6 3.1L7 12 4.5 11l-2 2 4 4 2-2-1-2.5 1-1.5 3.1 6 1.2-1.2c.4-.2.7-.6.6-1.1Z'/></svg>",
                                                            height: 30,
                                                            width: 30,
                                                            excavate: true,
                                                        }}
                                                    />
                                                </div>
                                                <p className="font-mono text-xl tracking-widest bg-slate-100 dark:bg-slate-900 px-6 py-2 rounded-full font-bold">
                                                    {tripId}
                                                </p>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-500 to-primary text-white border-0">
                            <CardContent className="p-6 relative overflow-hidden">
                                <Zap className="h-32 w-32 absolute -right-6 -bottom-6 opacity-10" />
                                <h3 className="font-bold text-lg mb-2 relative z-10">Real-Time Magic</h3>
                                <p className="text-indigo-100 text-sm opacity-90 relative z-10 leading-relaxed">
                                    Everything you do here is instantly synced across all devices. Notice how fast adding or checking an item feels!
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
