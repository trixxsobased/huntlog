"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGithubLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-sm space-y-6 px-4 text-center">
          <div className="h-10 w-10 rounded-sm bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-500">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Check your email</h1>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            We sent a confirmation link to <span className="text-white font-mono bg-white/5 py-0.5 px-1.5 rounded-sm">{email}</span>.
            <br />Click the link to activate your account.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")} className="w-full rounded-sm h-9 border-[#1f1f1f] bg-[#000000] hover:bg-white/5 text-white">
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Decorative (Hidden on mobile) */}
      <div className="hidden md:flex flex-col relative items-center justify-center bg-[#000000] p-8 overflow-hidden">
        {/* Top Left Wordmark */}
        <div className="absolute top-8 left-8">
          <span className="font-mono text-xs tracking-[0.3em] font-bold text-white uppercase">HUNTLOG</span>
        </div>

        {/* Central Animation */}
        <div className="relative flex flex-col items-center justify-center">
          <div 
            className="mb-8"
            style={{ 
              animation: "spin 20s linear infinite, crosshairPulse 4s ease-in-out infinite"
            }}
          >
            <style>{`
              @keyframes crosshairPulse {
                0%, 100% { filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.2)); transform: scale(1); }
                50% { filter: drop-shadow(0 0 25px rgba(124, 58, 237, 0.6)); transform: scale(1.05); }
              }
            `}</style>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-500 opacity-80">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Tagline */}
          <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase mt-4">
            TRACK. REPORT. RESOLVE.
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Visible on all) */}
      <div className="flex flex-col items-center justify-center bg-[#0a0a0a] p-8 sm:p-12">
        <div className="w-full max-w-[320px] space-y-8">
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold font-sans">Create account</h2>
            <p className="text-xs text-muted-foreground/80">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white/60 hover:text-white underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-9 rounded-sm bg-transparent border-[#1f1f1f] text-sm focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-9 rounded-sm bg-transparent border-[#1f1f1f] text-sm focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-9 rounded-sm bg-transparent border-[#1f1f1f] text-sm focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30"
              />
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-sm px-3 py-2 border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-sm h-9 bg-violet-600 hover:bg-violet-700 text-sm font-mono font-medium" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1f1f1f]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0a0a0a] px-3 text-white/20">
                  Or continue with
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full rounded-sm h-9 bg-transparent border-[#1f1f1f] hover:border-white/20 hover:bg-[#111111] text-sm font-medium transition-colors" onClick={handleGithubLogin}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="mr-2 h-4 w-4 fill-current">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
              GitHub
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
