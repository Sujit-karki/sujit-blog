import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Financial Disclaimer",
  description: `Financial disclaimer for ${siteConfig.name}. Content is for educational purposes only and does not constitute financial advice.`,
  alternates: { canonical: `${siteConfig.url}/disclaimer` },
  robots: { index: true, follow: false },
};

export default function DisclaimerPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Disclaimer" }];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Financial Disclaimer</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">Last updated: June 2026</p>
      </header>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Not Financial Advice</h2>
        <p>
          {siteConfig.name} (&quot;{siteConfig.name}&quot;, &quot;we&quot;, &quot;us&quot;) provides content about personal
          finance, investing, and financial markets for general informational and educational
          purposes only. None of the content on this website should be construed as financial,
          investment, tax, or legal advice.
        </p>

        <h2>No Guarantee of Accuracy</h2>
        <p>
          While we make every effort to ensure that the information on this site is accurate
          and up-to-date, we make no representations or warranties of any kind, express or
          implied, about the completeness, accuracy, reliability, or suitability of the
          information provided.
        </p>

        <h2>Investment Risk</h2>
        <p>
          All investing involves risk, including the possible loss of principal. Past performance
          is not indicative of future results. The value of investments can go down as well as up,
          and you may receive back less than you originally invested.
        </p>
        <p>
          Cryptocurrency and other speculative investments involve significantly higher risk than
          traditional investments and may result in the total loss of invested capital.
        </p>

        <h2>Consult a Professional</h2>
        <p>
          Before making any financial decisions, you should consult with a licensed and qualified
          financial advisor, tax professional, or legal counsel who can take into account your
          individual circumstances.
        </p>

        <h2>Affiliate Relationships</h2>
        <p>
          Some links on this site may be affiliate links. If you click on an affiliate link and
          make a purchase, we may receive a small commission at no extra cost to you. This does
          not influence our editorial content or recommendations.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this disclaimer can be directed to{" "}
          <a href={`mailto:${siteConfig.social.email}`}>{siteConfig.social.email}</a>.
        </p>
      </div>
    </div>
  );
}
