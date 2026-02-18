"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Redirecting...");
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-base-200">
      {/* Brand */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Meerly</h1>
        <p className="text-xs text-neutral mt-1 tracking-wide uppercase">Personal Finance</p>
      </div>

      {/* Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300 w-full max-w-sm">
        <div className="card-body p-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-sm text-neutral">Start tracking your finances in under 2 minutes</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <div className="form-control">
              <label className="label py-1" htmlFor="email">
                <span className="label-text text-sm font-medium">Email</span>
              </label>
              <input
                id="email"
                type="email"
                className="input input-bordered w-full input-sm h-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-control">
              <label className="label py-1" htmlFor="password">
                <span className="label-text text-sm font-medium">Password</span>
              </label>
              <input
                id="password"
                type="password"
                className="input input-bordered w-full input-sm h-10"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Create Account"}
            </button>
          </form>

          <div className="divider my-0 text-xs text-neutral">or</div>

          <p className="text-center text-sm text-neutral">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-xs text-neutral/60 mt-6">
        Double-entry accounting, made simple.
      </p>
    </div>
  );
}
