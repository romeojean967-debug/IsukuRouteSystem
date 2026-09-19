import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Recycle, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Isuku Route System" },
      {
        name: "description",
        content:
          "Sign in to Isuku Route System. Administrators, companies, employees, drivers and customers use the same login.",
      },
      { property: "og:title", content: "Sign in — Isuku Route System" },
      {
        property: "og:description",
        content: "One login for administrators, companies, staff, drivers and customers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleTerms, setGoogleTerms] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  }

  async function handleGoogle() {
    if (!googleTerms) {
      toast.error("Please accept the Terms & Conditions and Privacy Notice to continue with Google.");
      return;
    }
    // Remember the acceptance so it can be saved to the profile after the session is ready.
    window.sessionStorage.setItem("isuku-terms-accepted", "1");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed. Try email instead.");
  }

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="green-gradient flex size-9 items-center justify-center rounded-lg">
            <Recycle className="size-5" />
          </span>
          Isuku Route
        </Link>

        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One login for administrators, companies, employees, drivers and customers.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-pass">Password</Label>
              <Input id="si-pass" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-xs text-muted-foreground">
            <Checkbox
              checked={googleTerms}
              onCheckedChange={(v) => setGoogleTerms(v === true)}
              className="mt-0.5"
            />
            <span>
              I accept the{" "}
              <Link to="/terms" target="_blank" className="text-primary underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="text-primary underline">
                Privacy Notice
              </Link>{" "}
              to continue with Google.
            </span>
          </label>
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={!googleTerms}>
            Continue with Google
          </Button>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <p className="text-muted-foreground">Don&apos;t have an account?</p>
            <Link
              to="/register"
              className="mt-1 flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Building2 className="size-4" /> Register Company <ArrowRight className="size-4" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Employee and driver accounts are created by your company manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
