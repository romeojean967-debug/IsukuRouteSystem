import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { acceptTerms } from "@/lib/registration.functions";
import { useProfile } from "@/hooks/useSession";

/**
 * Blocks the workspace until the signed-in user has accepted the Terms & Conditions.
 * Google sign-ins never see a form before entering, so the acceptance is captured here
 * (or replayed from the checkbox ticked on the sign-in page).
 */
export function TermsGate({ children }: { children: React.ReactNode }) {
  const { profile, loading, user } = useProfile();
  const qc = useQueryClient();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsAcceptance = !!user && !loading && !!profile && !profile.terms_accepted_at;

  async function save() {
    setSaving(true);
    try {
      await acceptTerms();
      await qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your acceptance");
    } finally {
      setSaving(false);
    }
  }

  // Replay an acceptance ticked on the sign-in page before the Google redirect.
  useEffect(() => {
    if (!needsAcceptance) return;
    if (window.sessionStorage.getItem("isuku-terms-accepted") === "1") {
      window.sessionStorage.removeItem("isuku-terms-accepted");
      void save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsAcceptance]);

  if (!needsAcceptance) return <>{children}</>;

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <span className="green-gradient flex size-12 items-center justify-center rounded-xl">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">One last step</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Before entering the system you need to accept our Terms &amp; Conditions of Use and Privacy Notice.
        </p>
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-sm">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
          <span>
            I have read and accept the{" "}
            <Link to="/terms" target="_blank" className="text-primary underline">
              Terms &amp; Conditions
            </Link>{" "}
            and the{" "}
            <Link to="/privacy" target="_blank" className="text-primary underline">
              Privacy Notice
            </Link>
            .
          </span>
        </label>
        <Button className="mt-5 w-full" disabled={!checked || saving} onClick={save}>
          {saving ? "Saving..." : "Accept and enter"}
        </Button>
      </div>
    </div>
  );
}
