"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  submitPricingContact,
  type PricingPlanType,
} from "@/services/pricingContact";

type Props = {
  open: boolean;
  planType: PricingPlanType;
  onClose: () => void;
};

export function PricingContactModal({ open, planType, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setMessage("");
    }
  }, [open, planType]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPricingContact({
        planType,
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
      });
      toast.success("Thanks — we received your request. We'll be in touch soon.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const planLabel =
    planType === "standard" ? "Standard ($15 / user / month)" : "Enterprise / custom";

  return (
    <div
      className="hl-contact-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hl-contact-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hl-contact-panel">
        <div className="hl-contact-head">
          <h2 id="hl-contact-title">Contact us</h2>
          <p className="hl-contact-plan">{planLabel}</p>
          <button
            type="button"
            className="hl-contact-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="hl-contact-form">
          <label className="hl-contact-field">
            <span>Name *</span>
            <input
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="hl-contact-field">
            <span>Work email *</span>
            <input
              required
              type="email"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="hl-contact-field">
            <span>Company</span>
            <input
              maxLength={200}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
            />
          </label>
          <label className="hl-contact-field">
            <span>Phone</span>
            <input
              maxLength={50}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="hl-contact-field">
            <span>Message</span>
            <textarea
              maxLength={4000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your team size or requirements (optional)"
            />
          </label>
          <div className="hl-contact-actions">
            <button type="button" className="hl-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="hl-btn-primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
