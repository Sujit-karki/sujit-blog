import { z } from "zod";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Newsletter signup isn't configured yet." },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const res = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: parsed.data.email }),
  });

  if (res.ok) {
    return Response.json({ ok: true });
  }

  // Buttondown returns 400 with a "already subscribed"-style error for duplicates —
  // treat that as a success from the reader's point of view.
  const errorBody = await res.json().catch(() => null);
  const message = JSON.stringify(errorBody ?? "").toLowerCase();
  if (res.status === 400 && message.includes("already")) {
    return Response.json({ ok: true, alreadySubscribed: true });
  }

  return Response.json(
    { ok: false, error: "Something went wrong. Please try again." },
    { status: 502 }
  );
}
