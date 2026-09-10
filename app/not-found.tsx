import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFoundContent from "@/components/NotFoundContent";

// Lives at the app root, not inside (blog), because an unmatched URL never
// enters the route group — so this file has to bring its own Header/Footer or
// the reader lands on an unbranded page with no way back into the site.
// Most traffic here is the pre-June-2026 Blogger URL shape
// (/YYYY/MM/slug.html) that predates this site; those posts were not carried
// over, so the honest answer is a 404 that offers somewhere useful to go
// rather than a redirect to an unrelated article.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
