import { fieldNames, labels, validateInquiry, type Errors } from '../lib/inquiry';

declare global { interface Window { turnstile?: { reset: () => void } } }
async function initializeWalkthrough() {
  const form = document.querySelector<HTMLFormElement>('#walkthrough-form');
  if (!form) return;
  if (form.dataset.enabled !== 'true' && form.dataset.runtimeConfig === 'true') {
    try {
      const response = await fetch('/api/walkthrough/config', { cache: 'no-store', signal: AbortSignal.timeout(7000) });
      if (!response.ok) return;
      const config = await response.json();
      if (config.enabled !== true || typeof config.siteKey !== 'string' || !config.siteKey.trim()) return;
      const widget = form.querySelector<HTMLElement>('.cf-turnstile')!;
      widget.dataset.sitekey = config.siteKey;
      form.querySelector<HTMLElement>('.turnstile-wrapper')!.hidden = false;
      form.action = '/api/walkthrough';
      form.dataset.enabled = 'true';
      form.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach(fieldset => { fieldset.disabled = false; });
      const fallback = form.querySelector<HTMLElement>('.form-unavailable');
      if (fallback) fallback.hidden = true;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.append(script);
    } catch { return; } // Keep the phone fallback when runtime configuration is unavailable.
  }
  if (form.dataset.enabled !== 'true') return;
  const status = document.querySelector<HTMLElement>('#form-status')!;
  const button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
  button.disabled = false;
  const startedAt = Date.now();
  let requestId = crypto.randomUUID();
  let sending = false;
  const showErrors = (errors: Errors) => {
    for (const field of fieldNames) {
      const input = form.elements.namedItem(field) as HTMLInputElement;
      const error = document.getElementById(`${field}-error`)!;
      error.textContent = errors[field] || '';
      input.setAttribute('aria-invalid', String(Boolean(errors[field])));
    }
    status.replaceChildren(); status.classList.remove('success');
    if (Object.keys(errors).length) {
      const intro = document.createElement('p'); intro.textContent = 'Please check the following details:';
      const list = document.createElement('ul');
      for (const [field, message] of Object.entries(errors)) {
        const li = document.createElement('li'); const link = document.createElement('a'); link.href = `#${field}`;
        link.textContent = `${labels[field as keyof typeof labels]}: ${message}`;
        link.addEventListener('click', event => { event.preventDefault(); document.getElementById(field)?.focus(); });
        li.append(link); list.append(li);
      }
      status.append(intro, list); status.focus();
    }
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const { data, errors } = validateInquiry(values);
    showErrors(errors);
    if (Object.keys(errors).length) return;
    const token = values['cf-turnstile-response'];
    if (typeof token !== 'string' || !token) { status.textContent = 'Please complete the security check, then send your request.'; status.focus(); return; }
    sending = true; button.disabled = true; button.textContent = 'Sending your request…'; form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, turnstileToken: token, website: values.website || '', startedAt, requestId }), signal: AbortSignal.timeout(18000) });
      const result = await response.json();
      if (response.ok && result.accepted === true && typeof result.id === 'string') {
        status.textContent = 'Thank you. Your inquiry has been received. Blake will contact you to discuss your space and arrange a walkthrough. An appointment has not been booked.';
        status.classList.add('success'); document.getElementById('form-fields')!.hidden = true;
        form.removeAttribute('aria-busy'); status.focus(); return;
      }
      if (result.errors && typeof result.errors === 'object') showErrors(result.errors);
      else { status.textContent = result.message || 'Your request could not be sent. Your details are still here. Please try again.'; status.focus(); }
      // A changed inquiry must not reuse an earlier accepted idempotency key.
      if (response.status === 422) requestId = crypto.randomUUID();
      window.turnstile?.reset();
    } catch {
      status.textContent = 'We couldn’t confirm that your request was received. Your details are still here. Please try again, or use the direct contact details if shown.'; status.focus(); window.turnstile?.reset();
    } finally {
      sending = false; button.disabled = false; button.textContent = 'Send Walkthrough Request'; form.removeAttribute('aria-busy');
    }
  });
}
void initializeWalkthrough();
