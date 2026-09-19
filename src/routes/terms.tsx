import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions of Use — Isuku Route System" },
      {
        name: "description",
        content:
          "Business terms and conditions of use for companies, employees, drivers and customers of the Isuku Route System.",
      },
      { property: "og:title", content: "Terms & Conditions of Use — Isuku Route System" },
      { property: "og:description", content: "Conditions of use for the Isuku Route System." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Who we are",
    body: "Isuku Route System (AI-Powered EcoRoute) is operated by Prime Soft Ltd, Kigali, Rwanda. These terms govern the use of the platform by waste collection companies, their managers, office and field employees, drivers and their customers.",
  },
  {
    title: "2. Company accounts and approval",
    body: "A company account is created after a registration application is reviewed and approved by the system administrator. You must provide accurate business information, a valid RDB business registration certificate or, if not yet registered, a recent tax bill. The administrator may reject or suspend an application or account when the information is incomplete, false or misleading.",
  },
  {
    title: "3. Employee, driver and customer accounts",
    body: "Approved companies may create accounts for office employees, field employees and drivers. The company is responsible for the actions of the accounts it creates and must remove access when a person leaves the company. Customers may be registered by the company or sign in with Google.",
  },
  {
    title: "4. Acceptable use",
    body: "You agree to use the platform only for lawful waste collection operations: managing customers, households, schedules, routes, vehicles, payments, receipts and reports. You must not attempt to access data of another company, tamper with payments or receipts, or upload harmful content.",
  },
  {
    title: "5. Payments and receipts",
    body: "Payment records and digital receipts generated in the system are a record of the transaction between the company and its customer. Prime Soft Ltd is not a party to that transaction and is not responsible for refunds or disputes between a company and its customers.",
  },
  {
    title: "6. Data and privacy",
    body: "Personal data is processed as described in our Privacy Notice. Companies act as controllers of their customers' data and must respect Rwanda's Law No. 058/2021 relating to the protection of personal data and privacy.",
  },
  {
    title: "7. Availability and changes",
    body: "We aim to keep the service available at all times but do not guarantee uninterrupted access. We may update the platform or these terms; material changes will be shown in the application and continued use means you accept the updated terms.",
  },
  {
    title: "8. Termination",
    body: "You may stop using the platform at any time. We may suspend or terminate accounts that breach these terms. On termination, company data may be exported on request within 30 days.",
  },
  {
    title: "9. Contact",
    body: "Questions about these terms: info@isukuroute.rw, +250 780 000 000, Kigali, Rwanda.",
  },
];

function TermsPage() {
  return (
    <>
      <SiteHeader />
      <LegalPage
        eyebrow="Business agreement"
        title="Terms & Conditions of Use"
        intro="By registering a company, creating an account, or signing in with Google you accept these terms. Please read them carefully."
        sections={sections}
      />
      <SiteFooter />
    </>
  );
}
