import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/site';

interface GrowthReviewFormProps {
  defaultService?: string;
  compact?: boolean;
}

export function GrowthReviewForm({
  defaultService = 'SEO & Organic Search Growth',
  compact = false,
}: GrowthReviewFormProps) {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [serviceInterest, setServiceInterest] = useState(defaultService);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your name so we know who to address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 7) {
      setErrorMsg('Please enter a valid Kenyan phone or WhatsApp number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          websiteUrl: websiteUrl.trim(),
          serviceInterest,
          message: message.trim(),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        referenceId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Could not submit your enquiry right now.');
      }

      setSubmittedRef(data.referenceId || 'IMK-REVIEW');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to send your request. Please try WhatsApp or telephone directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div
        role="status"
        className="rounded-xl border border-[#D4E2D4] bg-white p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#157347]" aria-hidden="true" />
          <div>
            <h3 className="font-display text-lg font-bold text-[#141619]">
              Growth Review Request Received
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4B515A]">
              Thank you, <span className="font-semibold text-[#141619]">{name}</span>. Your
              enquiry reference is{' '}
              <span className="font-mono text-xs font-medium text-[#141619]">{submittedRef}</span>.
              We will review your details and get back to you within one business day.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={siteConfig.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#141619] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2E34]"
              >
                <MessageSquare className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
                <span>Send a quick WhatsApp message</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedRef(null);
                  setMessage('');
                }}
                className="rounded-lg border border-[#E2DFD7] px-4 py-2.5 text-sm font-medium text-[#141619] hover:bg-[#F7F6F2]"
              >
                Submit another request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-[#E2DFD7] bg-white p-6 sm:p-8"
    >
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold text-[#141619]">
          Request Your Free Growth Review
        </h3>
        <p className="mt-1.5 text-sm text-[#4B515A]">
          Share your website and primary commercial goal. We will review your visibility, speed,
          and enquiry path and send practical recommendations in plain language.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#E6B8B8] bg-[#FDF4F4] px-4 py-3 text-sm text-[#8B1E1E]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
        <div>
          <label htmlFor="gr-name" className="block text-xs font-semibold text-[#141619]">
            Your Name *
          </label>
          <input
            id="gr-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grace Wanjiku"
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gr-business" className="block text-xs font-semibold text-[#141619]">
            Business / Organisation
          </label>
          <input
            id="gr-business"
            name="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Savanna Hardware Ltd"
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gr-email" className="block text-xs font-semibold text-[#141619]">
            Work Email *
          </label>
          <input
            id="gr-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.ke"
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gr-phone" className="block text-xs font-semibold text-[#141619]">
            Phone / WhatsApp Number *
          </label>
          <input
            id="gr-phone"
            name="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +254 7XX XXX XXX"
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gr-website" className="block text-xs font-semibold text-[#141619]">
            Current Website URL
          </label>
          <input
            id="gr-website"
            name="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourbusiness.co.ke"
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gr-service" className="block text-xs font-semibold text-[#141619]">
            Primary Focus
          </label>
          <select
            id="gr-service"
            name="serviceInterest"
            value={serviceInterest}
            onChange={(e) => setServiceInterest(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] focus:border-[#141619] focus:bg-white focus:outline-none"
          >
            <option value="SEO & Organic Search Growth">SEO &amp; Organic Search Growth</option>
            <option value="Google Ads Management">Google Ads Management</option>
            <option value="Meta Ads (Facebook & Instagram)">
              Meta Ads (Facebook &amp; Instagram)
            </option>
            <option value="Website Design & Development">Website Design &amp; Development</option>
            <option value="Website Maintenance & Speed">Website Maintenance &amp; Speed</option>
            <option value="Full Digital Growth Strategy">Full Digital Growth Strategy</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="gr-message" className="block text-xs font-semibold text-[#141619]">
            What would you like to improve?
          </label>
          <textarea
            id="gr-message"
            name="message"
            rows={compact ? 3 : 4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us briefly about your business, what customers you want to attract, and any current challenges."
            className="mt-1.5 w-full rounded-lg border border-[#D6D2C9] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141619] placeholder:text-[#7B818A] focus:border-[#141619] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#F5B700] px-6 py-3 text-sm font-semibold text-[#141619] transition-colors hover:bg-[#DFA600] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending request…' : 'Request Free Growth Review'}
        </button>

        <p className="text-xs text-[#666D77]">
          Or speak directly:{' '}
          <a
            href={siteConfig.contact.phoneHref}
            className="font-semibold text-[#141619] underline decoration-[#E2DFD7] underline-offset-4 hover:decoration-[#141619]"
          >
            {siteConfig.contact.phoneDisplay}
          </a>
        </p>
      </div>
    </form>
  );
}
