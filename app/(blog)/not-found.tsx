import NotFoundContent from "@/components/NotFoundContent";

// Any notFound() inside the (blog) group — an unknown /posts/ slug under
// dynamicParams=false, an empty tag — renders inside the group layout, which
// already supplies Header and Footer. Without this file the root not-found is
// inherited here and brings its own pair, so the page showed two of each.
export default function BlogNotFound() {
  return <NotFoundContent />;
}
