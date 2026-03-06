"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PlaneTakeoff, Users, Zap, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const childVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    return (
        <div className="flex min-h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Decorative background elements */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <header className="px-6 lg:px-8 flex items-center justify-between h-20 w-full max-w-7xl mx-auto z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
                        <PlaneTakeoff className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Trip<span className="text-primary">Sync</span></span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="/join">
                        <Button variant="ghost" className="font-semibold hidden sm:inline-flex">Join Trip</Button>
                    </Link>
                    <Link href="/create">
                        <Button className="font-semibold shadow-md">Create Trip</Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center -mt-20 px-6 lg:px-8 z-10">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={childVariants} className="mb-6 flex justify-center">
                        <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold tracking-tight text-primary ring-1 ring-inset ring-primary/20">
                            Introducing real-time sync 🙌
                        </span>
                    </motion.div>

                    <motion.h1 variants={childVariants} className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl mb-8">
                        Pack Together,<br />
                        <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                            Travel Without Stress.
                        </span>
                    </motion.h1>

                    <motion.p variants={childVariants} className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                        The ultimate multiplayer checklist for group travels. Instantly see who's bringing what, assign tasks, and never forget an essential item again.
                    </motion.p>

                    <motion.div variants={childVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/create" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-xl shadow-primary/25 transition-all hover:-translate-y-1">
                                Start a New Trip
                                <PlaneTakeoff className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/join" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900">
                                Join with Code
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                        <div className="mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 text-blue-600 dark:text-blue-400">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Real-Time Sync</h3>
                        <p className="text-slate-500 dark:text-slate-400">Instant updates across all devices. No refreshing needed when someone checks an item.</p>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                        <div className="mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-4 text-indigo-600 dark:text-indigo-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Multiplayer Mode</h3>
                        <p className="text-slate-500 dark:text-slate-400">Invite friends via a simple link or ID. Assign items so everyone knows what to pack.</p>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center sm:col-span-2 lg:col-span-1">
                        <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Smart Categories</h3>
                        <p className="text-slate-500 dark:text-slate-400">Organize everything smoothly into Clothes, Electronics, Essentials, and Documents.</p>
                    </div>
                </motion.div>
            </main>

            {/* Decorative background elements bottom */}
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
            </div>
        </div>
    )
}
