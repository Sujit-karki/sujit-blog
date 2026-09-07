import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

interface DatasetSignupProps {
  /** What this post's dataset covers, in a few words — "the tax benchmark", "the CPI category table". */
  dataset: string;
  /** When it gets re-run, so the offer is concrete rather than "occasionally". */
  cadence?: string;
  /**
   * Filename of the dataset under /data/, if the rows are published. These are
   * copied out of research/data/ at build time by scripts/publish-data.mjs and
   * served from this site, so a reader gets the data without needing to go to
   * GitHub at all.
   */
  dataFile?: string;
}

/**
 * Contextual capture for the original-data posts.
 *
 * The generic "get new posts in your inbox" box at the foot of every article
 * asks a reader to commit to the whole site on the strength of one page. This
 * asks for something narrower and more concrete: the dataset they are already
 * reading about, and a note when it is re-computed.
 *
 * Placed mid-post rather than at the end, because the moment a reader is most
 * interested in a figure is immediately after seeing it — not after the
 * methodology section.
 */
export default function DatasetSignup({ dataset, cadence, dataFile }: DatasetSignupProps) {
  return (
    <aside className="not-prose my-8 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-6">
      <p className="font-bold text-gray-900 dark:text-white mb-1">
        Get {dataset} when it updates
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {cadence
          ? `This is re-run ${cadence}, and the numbers move. `
          : "This gets re-run as new data lands, and the numbers move. "}
        {dataFile ? (
          <>
            The raw rows are here as{" "}
            <a
              href={`/data/${dataFile}`}
              className="text-emerald-700 dark:text-emerald-400 hover:underline"
              download
            >
              {dataFile}
            </a>{" "}
            if you would rather just take the data — no signup needed for that.
          </>
        ) : (
          "No signup is needed to read anything here."
        )}
      </p>
      <NewsletterSignup />
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        One email per update. Unsubscribe in one click.
      </p>
    </aside>
  );
}
