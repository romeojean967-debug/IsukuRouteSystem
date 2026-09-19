import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Phone, FileText, Check, X, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/StatCard";
import { getApplicationDocumentUrl, reviewCompanyApplication } from "@/lib/registration.functions";
import { useProfile } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Company applications — Isuku Route System" },
      { name: "description", content: "Review, approve or reject company registration applications." },
      { property: "og:title", content: "Company applications — Isuku Route System" },
      { property: "og:description", content: "Approve or reject company registrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Applications,
});

type Filter = "pending" | "approved" | "rejected" | "all";

async function fetchApplications() {
  const { data, error } = await supabase
    .from("company_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

function Applications() {
  const qc = useQueryClient();
  const { role } = useProfile();
  const [filter, setFilter] = useState<Filter>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: apps, isLoading } = useQuery({
    queryKey: ["company_applications"],
    queryFn: fetchApplications,
    enabled: role === "admin",
  });

  const review = useMutation({
    mutationFn: (vars: { id: string; decision: "approved" | "rejected" }) =>
      reviewCompanyApplication({ data: { ...vars, note: notes[vars.id] ?? "" } }),
    onSuccess: (_d, vars) => {
      toast.success(vars.decision === "approved" ? "Company approved and activated" : "Application rejected");
      qc.invalidateQueries({ queryKey: ["company_applications"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save the decision"),
  });

  async function openDocument(path: string) {
    try {
      const { url } = await getApplicationDocumentUrl({ data: { path } });
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open the document");
    }
  }

  if (role !== "admin") {
    return <p className="text-sm text-muted-foreground">Only the system administrator can review applications.</p>;
  }

  const all = apps ?? [];
  const counts = {
    pending: all.filter((a) => a.status === "pending").length,
    approved: all.filter((a) => a.status === "approved").length,
    rejected: all.filter((a) => a.status === "rejected").length,
  };
  const list = filter === "all" ? all : all.filter((a) => a.status === filter);

  return (
    <div>
      <PageTitle
        title="Company applications"
        subtitle="Every company that registers appears here. Check the details and documents, then approve or reject."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for review" value={counts.pending} icon={Clock} />
        <StatCard label="Approved" value={counts.approved} icon={Check} />
        <StatCard label="Rejected" value={counts.rejected} icon={X} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading applications...</p>
        ) : list.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter} applications right now.
          </div>
        ) : (
          list.map((a) => (
            <article key={a.id} className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="green-gradient flex size-9 items-center justify-center rounded-lg">
                      <Building2 className="size-4" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold">{a.company_name}</h2>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(a.created_at).toLocaleDateString()} by {a.full_name} · {a.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "outline"}
                  className="capitalize"
                >
                  {a.status}
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      {[a.province, a.district, a.sector, a.cell].filter(Boolean).join(" – ")}
                      {(a.street || a.building) && (
                        <span className="block text-muted-foreground">
                          {[a.street, a.building].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-primary" />
                    {a.phone}
                    {a.office_phone ? <span className="text-muted-foreground">· office {a.office_phone}</span> : null}
                  </p>
                  {a.description ? <p className="text-muted-foreground">{a.description}</p> : null}
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Verification</p>
                  <p>
                    RDB registered:{" "}
                    <span className="font-medium">{a.rdb_registered ? "Yes" : "No"}</span>
                  </p>
                  {a.rdb_certificate_number ? (
                    <p>
                      Certificate no.: <span className="font-mono">{a.rdb_certificate_number}</span>
                    </p>
                  ) : null}
                  {a.document_path ? (
                    <Button size="sm" variant="outline" onClick={() => openDocument(a.document_path!)}>
                      <FileText className="size-4" />
                      Open {a.document_kind === "tax_bill" ? "tax bill" : "RDB certificate"}
                      <ExternalLink className="size-3.5" />
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">No document uploaded.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Business agreement accepted{" "}
                    {a.terms_accepted_at ? new Date(a.terms_accepted_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              {a.status === "pending" ? (
                <div className="mt-5 space-y-3">
                  <Textarea
                    rows={2}
                    placeholder="Optional note for your records (e.g. reason for rejection)"
                    value={notes[a.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => review.mutate({ id: a.id, decision: "approved" })}
                      disabled={review.isPending}
                    >
                      <Check className="size-4" /> Approve & activate company
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => review.mutate({ id: a.id, decision: "rejected" })}
                      disabled={review.isPending}
                    >
                      <X className="size-4" /> Reject
                    </Button>
                  </div>
                </div>
              ) : a.review_note ? (
                <p className="mt-4 text-sm text-muted-foreground">Note: {a.review_note}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
