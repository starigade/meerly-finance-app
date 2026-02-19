"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted">
      {/* Brand */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Meerly</h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">Personal Finance</p>
      </div>

      {/* Card */}
      <Card className="shadow-lg w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground">Start tracking your finances in under 2 minutes</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="h-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="h-10"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full mt-1" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Create Account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground/60 mt-6">
        Double-entry accounting, made simple.
      </p>
    </div>
  );
}
