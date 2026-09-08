import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
  robots: { index: true, follow: false },
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Privacy Policy" }];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6"><Breadcrumb items={breadcrumbItems} /></div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: June 2026</p>
      </header>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Information We Collect</h2>
        <p>
          {siteConfig.name} collects minimal information. We may collect anonymous analytics data
          (page views, referrer, browser type) to understand how visitors use our site.
          We do not collect personally identifiable information unless you contact us directly.
        </p>

        <h2>Cookies</h2>
        <p>
          We use a single localStorage key (<code>theme</code>) to remember your dark/light mode
          preference. This is not a tracking cookie and is never sent to any server.
          If we display third-party advertisements in the future, those providers may use cookies
          per their own privacy policies.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We may use Google Analytics (or similar) to analyze site traffic. These services may
          collect anonymous usage data per their own privacy policies. We do not sell or share
          personally identifiable information with third parties.
        </p>

        <h2>Advertising</h2>
        <p>
          This site may display advertisements served by Google AdSense or similar ad networks.
          These networks may use cookies to serve ads based on your prior visits to this website
          and other websites. You can opt out of personalized advertising by visiting
          Google&apos;s Ad Settings.
        </p>

        <h2>Links to Other Websites</h2>
        <p>
          Our site may contain links to third-party websites. We have no control over, and
          assume no responsibility for, the content or privacy practices of any third-party sites.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to children under 13. We do not knowingly collect
          personal information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated date.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, contact us at{" "}
          <a href={`mailto:${siteConfig.social.email}`}>{siteConfig.social.email}</a>.
        </p>
      </div>
    </div>
  );
}
