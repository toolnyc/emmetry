"use client";

import { useState } from "react";
import { PageReveal } from "@/app/components/PageReveal";

const monoLabel = "font-mono uppercase text-ghost-strong";
const labelStyle = {
  fontSize: "var(--text-label)",
  letterSpacing: "var(--tracking-nav)",
} as React.CSSProperties;

const inputClass =
  "w-full border-b border-rule bg-transparent font-mono text-ink outline-none py-2 placeholder:text-ghost-faint transition-colors focus:border-ghost-strong";

type Status = "idle" | "sending" | "sent" | "error";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"update" | "access">("update");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <PageReveal>
      <main className="min-h-screen bg-paper px-8 py-12 md:px-16 pb-24">
        <h1
          data-reveal
          className="font-sans font-[400] leading-[0.95] text-ghost-strong"
          style={{
            fontSize: "var(--text-display)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          Submit
        </h1>

        <p
          data-reveal
          className="mt-8 max-w-md font-sans text-ink"
          style={{
            fontSize: "var(--text-body)",
            lineHeight: "var(--text-body--line-height)",
          }}
        >
          Have a correction, a missing record, or want to request edit access?
          Use this form to get in touch.
        </p>

        {status === "sent" ? (
          <div
            data-reveal
            className="mt-12 max-w-md font-mono text-ghost-strong border-t border-rule pt-8"
            style={labelStyle}
          >
            Message received. We&apos;ll be in touch.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-12 max-w-md space-y-8 border-t border-rule pt-8"
            data-reveal
          >
            {/* Name */}
            <div className="space-y-2">
              <label className={monoLabel} style={labelStyle}>
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
                style={labelStyle}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={monoLabel} style={labelStyle}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputClass}
                style={labelStyle}
              />
            </div>

            {/* Type */}
            <div className="space-y-3">
              <span className={monoLabel} style={labelStyle}>
                Type
              </span>
              <div className="flex flex-col gap-2 pt-1">
                {(
                  [
                    { value: "update", label: "Family record update" },
                    { value: "access", label: "Request edit access" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <span
                      onClick={() => setType(opt.value)}
                      className={`w-3 h-3 rounded-full border flex-shrink-0 transition-colors cursor-pointer ${
                        type === opt.value
                          ? "bg-ink border-ink"
                          : "bg-transparent border-ghost-mid"
                      }`}
                    />
                    <span
                      className={`font-mono transition-colors ${
                        type === opt.value ? "text-ink" : "text-ghost-strong"
                      }`}
                      style={labelStyle}
                      onClick={() => setType(opt.value)}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className={monoLabel} style={labelStyle}>
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the update or your connection to the family…"
                className={`${inputClass} resize-none`}
                style={labelStyle}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-6 pt-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className={`font-mono uppercase text-ink border border-ink px-5 py-2 transition-opacity ${
                  status === "sending" ? "opacity-40 cursor-not-allowed" : "hover:opacity-60"
                }`}
                style={labelStyle}
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
              {status === "error" && (
                <span
                  className="font-mono text-union"
                  style={labelStyle}
                >
                  Something went wrong. Try again.
                </span>
              )}
            </div>
          </form>
        )}
      </main>
    </PageReveal>
  );
}
