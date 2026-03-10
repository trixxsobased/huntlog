"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGithubLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Decorative (Hidden on mobile) */}
      <div className="hidden md:flex flex-col relative items-center justify-center bg-[#000000] p-8 overflow-hidden">
        {/* Top Left Wordmark */}
        <div className="absolute top-8 left-8 z-30">
          <span className="font-mono text-xs tracking-[0.3em] font-bold text-white uppercase">HUNTLOG</span>
        </div>

        {/* Matrix Characters Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none font-mono text-white select-none z-0">
          <style>{`
            @keyframes matrixFade {
              0%, 100% { opacity: 0.05; }
              50% { opacity: 0.1; }
            }
          `}</style>
          <div className="absolute top-[15%] left-[25%] text-sm" style={{ animation: "matrixFade 4s infinite 0.5s" }}>0</div>
          <div className="absolute top-[35%] left-[80%] text-xs" style={{ animation: "matrixFade 3s infinite 1.2s" }}>/</div>
          <div className="absolute top-[65%] left-[15%] text-sm" style={{ animation: "matrixFade 5s infinite 2.1s" }}>1</div>
          <div className="absolute top-[85%] left-[70%] text-xs" style={{ animation: "matrixFade 4.5s infinite 0.3s" }}>{'>'}</div>
          <div className="absolute top-[40%] left-[45%] text-xs" style={{ animation: "matrixFade 3.5s infinite 1.8s" }}>#</div>
          <div className="absolute top-[18%] left-[65%] text-sm" style={{ animation: "matrixFade 4s infinite 2.5s" }}>\\</div>
          <div className="absolute top-[75%] left-[35%] text-xs" style={{ animation: "matrixFade 3s infinite 0.7s" }}>{';'}</div>
          <div className="absolute top-[50%] left-[85%] text-sm" style={{ animation: "matrixFade 5.5s infinite 1.1s" }}>{'<'}</div>
        </div>

        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay">
          <style>{`
            @keyframes scanline {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
          `}</style>
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 2px, #fff 2px, #fff 4px)" }}
          />
          <div 
            className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent"
            style={{ animation: "scanline 8s linear infinite" }}
          />
        </div>

        {/* Central Animation: Glitch Text */}
        <div className="relative flex flex-col items-center justify-center z-10">
          <style>{`
            @keyframes glitch-anim-1 {
              0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
              20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
              40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, -2px); }
              60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 2px); }
              80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, -1px); }
              100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, 2px); }
            }
            @keyframes glitch-anim-2 {
              0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
              20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 2px); }
              40% { clip-path: inset(70% 0 10% 0); transform: translate(1px, -1px); }
              60% { clip-path: inset(20% 0 50% 0); transform: translate(-1px, 1px); }
              80% { clip-path: inset(50% 0 30% 0); transform: translate(2px, -2px); }
              100% { clip-path: inset(5% 0 80% 0); transform: translate(-2px, 1px); }
            }
            .glitch-wrapper {
              position: relative;
            }
            .glitch-text {
              position: relative;
              color: rgba(255, 255, 255, 0.8);
            }
            .glitch-text::before, .glitch-text::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #000;
            }
            .glitch-text::before {
              left: 2px;
              text-shadow: -2px 0 #06b6d4; /* Cyan */
              animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
            }
            .glitch-text::after {
              left: -2px;
              text-shadow: -2px 0 #7c3aed; /* Violet */
              animation: glitch-anim-2 3s infinite linear alternate-reverse;
            }
          `}</style>
          
          <div className="glitch-wrapper mb-2">
            <h1 className="glitch-text font-mono text-4xl font-bold tracking-widest text-white/80" data-text="HUNTLOG">
              HUNTLOG
            </h1>
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
            <h2 className="text-lg font-semibold font-sans">Sign in</h2>
            <p className="text-xs text-muted-foreground/80">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-white/60 hover:text-white underline underline-offset-4 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                autoComplete="current-password"
                className="h-9 rounded-sm bg-transparent border-[#1f1f1f] text-sm focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30"
              />
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-sm px-3 py-2 border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-sm h-9 bg-violet-600 hover:bg-violet-700 text-sm font-mono font-medium" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
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
