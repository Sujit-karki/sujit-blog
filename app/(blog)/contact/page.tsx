import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} — questions, feedback, or collaboration inquiries.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Contact" }];
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Contact</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          Have a question, feedback, or want to collaborate? Reach out using the information below.
        </p>
      </header>

      <div className="grid gap-5 mb-8">
        {siteConfig.social.email && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Email</h2>
            </div>
            <a href={`mailto:${siteConfig.social.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">
              {siteConfig.social.email}
            </a>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Response Time</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            We typically respond within 2–3 business days. For press or media inquiries,
            please include your publication name and deadline in your message.
          </p>
        </div>

      </div>
    </div>
  );
}
