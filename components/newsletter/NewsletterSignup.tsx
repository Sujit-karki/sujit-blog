"use client";

import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterSignupProps {
  variant?: "inline" | "footer";
}

// GA4 is loaded only when NEXT_PUBLIC_GA_ID is set (see app/layout.tsx), so the
// same guard applies here. Without it sendGAEvent logs "GA has not been
// initialized" to the console on every local signup — a warning that trains you
// to ignore console output, which is where the real failures show up.
function trackSignup(variant: NewsletterSignupProps["variant"]) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  // gtag argument form: ('event', <name>, <params>). The event name is what
  // appears verbatim in Reports -> Engagement -> Events, and is what gets
  // marked as a key event in Admin -> Events.
  sendGAEvent("event", "newsletter_signup", { variant });
}

export default function NewsletterSignup({ variant = "inline" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        // Only a genuinely new subscriber counts. The API deliberately reports
        // an existing subscriber as ok:true so the reader isn't scolded for
        // re-submitting, but counting that as a signup would inflate the key
        // event every time someone forgets they already joined.
        if (!data.alreadySubscribed) trackSignup(variant);
      } else {
        setStatus("error");
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p
        className={
          variant === "footer"
            ? "text-sm text-emerald-700 dark:text-emerald-400"
            : "text-sm font-medium text-emerald-700 dark:text-emerald-300"
        }
      >
        You&apos;re subscribed — check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors shrink-0"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400 sm:basis-full">{error}</p>
      )}
    </form>
  );
}
