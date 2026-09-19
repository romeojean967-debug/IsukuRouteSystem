import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Recycle,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  FileCheck2,
  Upload,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { rwandaDistricts, rwandaProvinces, passwordChecks, isStrongPassword } from "@/lib/rwanda";
import { submitCompanyApplication } from "@/lib/registration.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register your company — Isuku Route System" },
      {
        name: "description",
        content:
          "Register your waste collection company on Isuku Route System. Create your manager account, describe your business and submit your RDB certificate or tax bill for review.",
      },
      { property: "og:title", content: "Register your company — Isuku Route System" },
      {
        property: "og:description",
        content: "Three quick steps to apply for a company account on Isuku Route System.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const steps = [
  { label: "Your account", icon: User },
  { label: "Company details", icon: Building2 },
  { label: "Verification", icon: FileCheck2 },
];

type FormState = {
  full_name: string;
  email: string;
  password: string;
  confirm: string;
  company_name: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  description: string;
  street: string;
  building: string;
  phone: string;
  office_phone: string;
  rdb_registered: "yes" | "no" | "";
  rdb_certificate_number: string;
  file: File | null;
  terms: boolean;
};

const initial: FormState = {
  full_name: "",
  email: "",
  password: "",
  confirm: "",
  company_name: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  description: "",
  street: "",
  building: "",
  phone: "",
  office_phone: "",
  rdb_registered: "",
  rdb_certificate_number: "",
  file: null,
  terms: false,
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const checks = useMemo(() => passwordChecks(form.password), [form.password]);
  const districts = form.province ? (rwandaDistricts[form.province] ?? []) : [];

  function validateStep(): string | null {
    if (step === 0) {
      if (form.full_name.trim().length < 2) return "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid primary email";
      if (!isStrongPassword(form.password)) return "Your password is not strong enough yet";
      if (form.password !== form.confirm) return "Passwords do not match";
    }
    if (step === 1) {
      if (form.company_name.trim().length < 2) return "Enter your business / company name";
      if (!form.province || !form.district || !form.sector.trim())
        return "Select the province, district and sector of your business";
      if (form.phone.trim().length < 9) return "Enter a phone number for the boss or the office";
    }
    if (step === 2) {
      if (!form.rdb_registered) return "Tell us whether your company is registered in RDB";
      if (form.rdb_registered === "yes" && form.rdb_certificate_number.trim().length < 3 && !form.file)
        return "Enter your RDB registration certificate number or upload the certificate";
      if (form.rdb_registered === "no" && !form.file) return "Upload your tax bill";
      if (!form.terms) return "You must accept the Terms & Conditions and Privacy Notice";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  async function submit() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      let document_base64 = "";
      let document_name = "";
      if (form.file) {
        if (form.file.size > 8 * 1024 * 1024) throw new Error("The document must be smaller than 8 MB");
        document_base64 = await fileToBase64(form.file);
        document_name = form.file.name;
      }
      await submitCompanyApplication({
        data: {
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          company_name: form.company_name.trim(),
          province: form.province,
          district: form.district,
          sector: form.sector.trim(),
          cell: form.cell.trim(),
          street: form.street.trim(),
          building: form.building.trim(),
          description: form.description.trim(),
          phone: form.phone.trim(),
          office_phone: form.office_phone.trim(),
          rdb_registered: form.rdb_registered === "yes",
          rdb_certificate_number: form.rdb_certificate_number.trim(),
          document_name,
          document_base64,
          document_kind: form.rdb_registered === "yes" ? "rdb_certificate" : "tax_bill",
          terms_accepted: true,
        },
      });
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hero-glow min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="green-gradient flex size-9 items-center justify-center rounded-lg">
            <Recycle className="size-5" />
          </span>
          Isuku Route
        </Link>

        {done ? (
          <div className="surface-card p-10 text-center">
            <span className="green-gradient mx-auto flex size-16 items-center justify-center rounded-2xl">
              <PartyPopper className="size-8" />
            </span>
            <h1 className="mt-6 text-2xl font-bold md:text-3xl">Application sent!</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Your application has been sent to the administrator to be reviewed. You will get a
              response as soon as possible. Thanks for choosing our system!
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              You can already sign in with <span className="text-foreground">{form.email}</span> to
              follow the status of your application.
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth">Go to sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="surface-card p-6 md:p-8">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">Register Company</p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">Create your company account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Three steps. The administrator reviews every application before it goes live.
              </p>
            </div>

            <ol className="mb-8 grid grid-cols-3 gap-2">
              {steps.map((s, i) => {
                const state = i < step ? "done" : i === step ? "current" : "todo";
                return (
                  <li key={s.label} className="flex flex-col items-start gap-2">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        state === "todo" ? "bg-muted" : "bg-primary"
                      }`}
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full border ${
                          state === "done"
                            ? "border-primary bg-primary text-primary-foreground"
                            : state === "current"
                              ? "border-primary text-primary"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {state === "done" ? <Check className="size-3.5" /> : <s.icon className="size-3.5" />}
                      </span>
                      <span className={state === "todo" ? "text-muted-foreground" : "font-medium"}>
                        {s.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            {step === 0 && (
              <div className="space-y-4">
                <Field label="Full name" id="full_name">
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="e.g. Jean Romeo"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Primary email" id="email">
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@company.rw"
                    autoComplete="email"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password" id="password">
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field label="Confirm password" id="confirm">
                    <Input
                      id="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={(e) => set("confirm", e.target.value)}
                      autoComplete="new-password"
                    />
                  </Field>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="mb-3 flex gap-1">
                    {checks.map((c, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${c.ok ? "bg-primary" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mb-2 text-xs font-medium">Use a strong password:</p>
                  <ul className="grid gap-1 text-xs sm:grid-cols-2">
                    {checks.map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-2 ${c.ok ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <Check className={`size-3.5 ${c.ok ? "" : "opacity-30"}`} /> {c.label}
                      </li>
                    ))}
                    <li
                      className={`flex items-center gap-2 ${
                        form.confirm && form.confirm === form.password ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Check
                        className={`size-3.5 ${form.confirm && form.confirm === form.password ? "" : "opacity-30"}`}
                      />{" "}
                      Passwords match
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Field label="Business / company name" id="company_name">
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={(e) => set("company_name", e.target.value)}
                    placeholder="e.g. Kigali Clean Ltd"
                  />
                </Field>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Where is your business located?
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Province" id="province">
                    <NativeSelect
                      id="province"
                      value={form.province}
                      onChange={(v) => {
                        set("province", v);
                        set("district", "");
                      }}
                      options={rwandaProvinces}
                      placeholder="Select province"
                    />
                  </Field>
                  <Field label="District" id="district">
                    <NativeSelect
                      id="district"
                      value={form.district}
                      onChange={(v) => set("district", v)}
                      options={districts}
                      placeholder={form.province ? "Select district" : "Select province first"}
                    />
                  </Field>
                  <Field label="Sector" id="sector">
                    <Input id="sector" value={form.sector} onChange={(e) => set("sector", e.target.value)} />
                  </Field>
                  <Field label="Cell" id="cell">
                    <Input id="cell" value={form.cell} onChange={(e) => set("cell", e.target.value)} />
                  </Field>
                  <Field label="Street" id="street">
                    <Input
                      id="street"
                      value={form.street}
                      onChange={(e) => set("street", e.target.value)}
                      placeholder="e.g. KG 11 Ave"
                    />
                  </Field>
                  <Field label="Building" id="building">
                    <Input
                      id="building"
                      value={form.building}
                      onChange={(e) => set("building", e.target.value)}
                      placeholder="e.g. Kigali Heights, 3rd floor"
                    />
                  </Field>
                </div>
                <Field label="Description of your business" id="description">
                  <Textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="What waste do you collect, which areas do you serve, how many households..."
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone number (boss)" id="phone">
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+250 7xx xxx xxx"
                    />
                  </Field>
                  <Field label="Phone number (office, optional)" id="office_phone">
                    <Input
                      id="office_phone"
                      type="tel"
                      value={form.office_phone}
                      onChange={(e) => set("office_phone", e.target.value)}
                      placeholder="+250 7xx xxx xxx"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-medium">Is your company registered in RDB?</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["yes", "no"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set("rdb_registered", v)}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          form.rdb_registered === v
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium">{v === "yes" ? "Yes, registered in RDB" : "No, not yet"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {v === "yes"
                            ? "You will enter your RDB business registration certificate."
                            : "You will upload a recent tax bill instead."}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {form.rdb_registered === "yes" && (
                  <>
                    <Field label="RDB business registration certificate number" id="rdb">
                      <Input
                        id="rdb"
                        value={form.rdb_certificate_number}
                        onChange={(e) => set("rdb_certificate_number", e.target.value)}
                        placeholder="e.g. 123456789"
                      />
                    </Field>
                    <FilePicker
                      label="Upload the RDB certificate (optional but recommended)"
                      file={form.file}
                      onChange={(f) => set("file", f)}
                    />
                  </>
                )}
                {form.rdb_registered === "no" && (
                  <FilePicker
                    label="Upload your tax bill"
                    file={form.file}
                    onChange={(f) => set("file", f)}
                  />
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 text-sm">
                  <Checkbox
                    checked={form.terms}
                    onCheckedChange={(v) => set("terms", v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the business{" "}
                    <Link to="/terms" target="_blank" className="text-primary underline">
                      Terms &amp; Conditions of Use
                    </Link>{" "}
                    and the{" "}
                    <Link to="/privacy" target="_blank" className="text-primary underline">
                      Privacy Notice
                    </Link>
                    , and I confirm the information provided is true.
                  </span>
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
              >
                <ChevronLeft className="size-4" /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Next <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="button" onClick={submit} disabled={submitting || !form.terms}>
                  {submitting ? "Sending application..." : "Finish & send application"}
                </Button>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function FilePicker({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm transition-colors hover:border-primary/60">
        <Upload className="size-5 text-primary" />
        <span className="flex-1 truncate">
          {file ? file.name : "Choose a PDF or image (max 8 MB)"}
        </span>
        <input
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
