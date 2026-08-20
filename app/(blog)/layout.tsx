import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* FinancialTicker lives on the homepage only (see page.tsx), not here —
          it polls live market data every 30s and was previously mounted on
          every route including all article pages, adding dynamic-content
          noise and a repeated CLS/INP cost sitewide for no reader benefit on
          a post page. */}
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
