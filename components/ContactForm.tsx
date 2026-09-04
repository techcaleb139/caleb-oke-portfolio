import { FormEvent, useEffect, useRef, useState } from "react";
import { contact, profile } from "../src/content/site.ts";

type Field = "name" | "contact" | "workflow";
type Errors = Partial<Record<Field, string>>;
type State = "idle" | "submitting" | "success" | "error";

/* The three fields the visitor fills in. The DOM ids differ from the field
   names because the page already has a section with id="contact". */
const fieldIds: Record<Field, string> = {
  name: "name",
  contact: "reply-contact",
  workflow: "workflow",
};

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const looksLikePhone = (value: string) => (value.match(/\d/g) ?? []).length >= 7;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = contact.errors.name;

  const reply = values.contact.trim();
  if (!reply || !(looksLikeEmail(reply) || looksLikePhone(reply))) {
    errors.contact = contact.errors.contact;
  }

  if (!values.workflow.trim()) errors.workflow = contact.errors.workflow;
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", contact: "", workflow: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<State>("idle");
  const successRef = useRef<HTMLParagraphElement>(null);

  // Move focus to the confirmation so the change is announced rather than
  // silently swapping the form out from under a screen reader.
  useEffect(() => {
    if (state === "success") successRef.current?.focus();
  }, [state]);

  function update(field: Field, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Only re-validate live once the visitor has tried to send, so errors
    // do not appear while they are still typing the first time.
    if (submitted) setErrors(validate(next));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting" || state === "success") return;

    const form = event.currentTarget;
    if (new FormData(form).get("website")) return;

    setSubmitted(true);
    const found = validate(values);
    setErrors(found);

    const firstInvalid = (Object.keys(fieldIds) as Field[]).find((field) => found[field]);
    if (firstInvalid) {
      form.ownerDocument.getElementById(fieldIds[firstInvalid])?.focus();
      return;
    }

    setState("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          contact: values.contact.trim(),
          business: "",
          workflow: values.workflow.trim(),
          outcome: "",
          website: "",
        }),
      });
      if (!response.ok) throw new Error("request failed");
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="formSuccess">
        <p className="successHeading" tabIndex={-1} ref={successRef}>
          {contact.success.heading}
        </p>
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
      {/* Spam protection, unchanged: this decoy pairs with the same-origin
          check in api/contact.ts. A bot that fills it gets a silent 200. */}
      <input className="honeypot" type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" />

      <TextField field="name" label={contact.labels.name} value={values.name} error={errors.name} onChange={update} autoComplete="name" />
      <TextField field="contact" label={contact.labels.contact} value={values.contact} error={errors.contact} onChange={update} autoComplete="email" />
      <TextField field="workflow" label={contact.labels.workflow} value={values.workflow} error={errors.workflow} onChange={update} multiline />

      <div className="formActions">
        <button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? contact.sending : contact.submit}
        </button>
        <span className="formNote">{contact.note}</span>
      </div>

      <p className="formStatus" role="status">
        {state === "error" ? contact.errors.failed : ""}
      </p>
    </form>
  );
}

type TextFieldProps = {
  field: Field;
  label: string;
  value: string;
  error?: string;
  onChange: (field: Field, value: string) => void;
  multiline?: boolean;
  autoComplete?: string;
};

function TextField({ field, label, value, error, onChange, multiline, autoComplete }: TextFieldProps) {
  const id = fieldIds[field];
  const errorId = `${id}-error`;

  const shared = {
    id,
    name: field,
    value,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: (event: { target: { value: string } }) => onChange(field, event.target.value),
  };

  return (
    <p className="field">
      <label htmlFor={id}>{label}</label>
      {multiline
        ? <textarea {...shared} rows={4} data-invalid={error ? "" : undefined} />
        : <input {...shared} type="text" data-invalid={error ? "" : undefined} />}
      {error ? <span className="fieldError" id={errorId}>{error}</span> : null}
    </p>
  );
}
