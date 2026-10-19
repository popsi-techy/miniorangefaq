/** Fields mirror the support form on faq.miniorange.in (including its honeypot). */
export interface SupportValues {
  email: string;
  number: string;
  requestType: string;
  query: string;
  /** Honeypot ("Company"), hidden from people. Must stay empty. */
  website: string;
}
export type SupportErrors = Partial<Record<keyof SupportValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Same rule as the source form: digits only, 6–15 characters. */
const PHONE_RE = /^[0-9]{6,15}$/;

export function validateSupport(v: SupportValues): SupportErrors {
  const e: SupportErrors = {};
  if (!v.email.trim()) e.email = 'Enter your email address so we can reply.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address, like name@company.com.';
  if (v.number.trim() && !PHONE_RE.test(v.number.trim())) e.number = 'Use digits only (6–15), without spaces or +.';
  if (!v.requestType) e.requestType = 'Choose what you are looking for.';
  if (!v.query.trim()) e.query = 'Describe how we can help.';
  else if (v.query.trim().length < 10) e.query = 'Add a little more detail (at least 10 characters).';
  return e;
}
