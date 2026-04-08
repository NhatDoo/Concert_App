"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error("Failed to request reset. Please try again.");
            }

            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl blur opacity-25"></div>

                <div className="relative bg-[#0F172A]/80 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Forgot Password
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {status === "success" ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
                            <p className="text-emerald-200/80 text-sm">
                                We've sent a password reset link to <br /><span className="font-medium text-white">{email}</span>
                            </p>
                            <Link href="/login" className="mt-6 inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Return to Login <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {status === "error" && (
                                <div className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3 border border-red-400/20">
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>

                            <div className="text-center mt-6">
                                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
                                    Remember your password? Log in
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
