import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Isuku Route System" },
      {
        name: "description",
        content:
          "How Isuku Route System collects, uses and protects personal data of companies, employees, drivers and customers.",
      },
      { property: "og:title", content: "Privacy Notice — Isuku Route System" },
      { property: "og:description", content: "How we handle your personal data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "1. What we collect",
    body: "Account details (full name, email, phone, password hash), company details (business name, location, description, RDB certificate number or tax bill document), employee and driver details (position, hire date, driving licence), customer details (name, phone, address, household location) and operational data (schedules, routes, payments, receipts, reports).",
  },
  {
    title: "2. Why we use it",
    body: "To create and secure your account, review company applications, run daily waste collection operations, issue receipts, generate reports for companies, and to contact you about the service. We do not sell personal data.",
  },
  {
    title: "3. Google sign-in",
    body: "If you continue with Google we receive your name, email address and profile picture from Google to create or match your account. We never see your Google password.",
  },
  {
    title: "4. Who can see your data",
    body: "Your data is visible only to your own company's authorised staff and to the system administrator for support and review. Verification documents are stored privately and are only opened by the administrator during the review of an application.",
  },
  {
    title: "5. Storage and security",
    body: "Data is stored in a secured cloud database with row-level access controls, encryption in transit and regular backups. Access is limited by role: administrator, company manager, office / field employee, driver and customer.",
  },
  {
    title: "6. Your rights",
    body: "Under Rwanda's data protection law you may request access to, correction or deletion of your personal data, or object to certain processing. Contact your company manager or info@isukuroute.rw. We respond within 30 days.",
  },
  {
    title: "7. Retention",
    body: "Account data is kept while your account is active and for up to 12 months after closure, unless a longer period is required for accounting or legal reasons. Rejected company applications and their documents are deleted after 6 months.",
  },
  {
    title: "8. Contact",
    body: "Prime Soft Ltd — Isuku Route System, Kigali, Rwanda. info@isukuroute.rw · +250 780 000 000.",
  },
];

function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <LegalPage
        eyebrow="Your data"
        title="Privacy Notice"
        intro="This notice explains what personal data the Isuku Route System collects, why, and how you stay in control of it."
        sections={sections}
      />
      <SiteFooter />
    </>
  );
}
