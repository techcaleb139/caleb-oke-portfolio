import { FormEvent, useState } from "react";
import { contact, profile } from "../src/content/site.ts";

type State = "idle" | "submitting" | "success" | "error";

/* Phase 3 builds the visible form. Phase 4 hardens it: inline errors wired
   with aria-describedby, the success replacement, and the payload spec. */
export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting" || state === "success") return;

    const data = new FormData(event.currentTarget);
    if (data.get("website")) return;

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          contact: String(data.get("contact") ?? "").trim(),
          business: "",
          workflow: String(data.get("workflow") ?? "").trim(),
          outcome: "",
          website: "",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "The message could not be sent.");
      }
      setState("success");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The message could not be sent.");
    }
  }

  if (state === "success") {
    return (
      <div className="formSuccess">
        <p className="successHeading">{contact.success.heading}</p>
        <p>{contact.success.body}</p>
        <div className="successLinks">
          <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </div>
      </div>
    );
  }

  return (
    <form className="contactForm" onSubmit={onSubmit} noValidate>
      <input className="honeypot" type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" />

      <p className="field">
        <label htmlFor="name">{contact.labels.name}</label>
        <input id="name" name="name" type="text" autoComplete="name" required />
      </p>

      <p className="field">
        <label htmlFor="reply-contact">{contact.labels.contact}</label>
        <input id="reply-contact" name="contact" type="text" autoComplete="email" required />
      </p>

      <p className="field">
        <label htmlFor="workflow">{contact.labels.workflow}</label>
        <textarea id="workflow" name="workflow" rows={4} required />
      </p>

      <div className="formActions">
        <button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Sending..." : contact.submit}
        </button>
        <span className="formNote">{contact.note}</span>
      </div>

      <p className="formStatus" role="status">{message}</p>
    </form>
  );
}
