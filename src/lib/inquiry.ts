export const towns = ['Bailey', 'Conifer', 'Evergreen'] as const;
export const sizes = ['Not sure', 'Under 1,000 sq ft', '1,000–2,500 sq ft', '2,500–5,000 sq ft', '5,000–10,000 sq ft', 'Over 10,000 sq ft'];
export const frequencies = ['Help me decide', 'Once a week', 'Twice a week', 'Three times a week', 'Other / let’s discuss'];
export const businessTypes = ['Office / professional workspace', 'Retail shop / showroom', 'Studio / community space', 'Commercial common area', 'Other'];
export const contactMethods = ['Either is fine', 'Phone', 'Email'];
export const fieldNames = ['contactName', 'businessName', 'town', 'phone', 'email', 'businessAddress', 'businessType', 'squareFootage', 'frequency', 'preferredContact', 'message'] as const;
export type InquiryField = typeof fieldNames[number];
export type Inquiry = Record<InquiryField, string>;
export type Errors = Partial<Record<InquiryField, string>>;
export const labels: Record<InquiryField, string> = { contactName: 'Contact name', businessName: 'Business name', town: 'Town', phone: 'Phone', email: 'Email', businessAddress: 'Business address', businessType: 'Business type', squareFootage: 'Approximate square footage', frequency: 'Desired cleaning frequency', preferredContact: 'Preferred contact method', message: 'Your space and needs' };
export function validateInquiry(raw: Record<string, unknown>): { data: Inquiry; errors: Errors } {
  const data = Object.fromEntries(fieldNames.map(name => [name, typeof raw[name] === 'string' ? raw[name].trim() : ''])) as Inquiry;
  const errors: Errors = {};
  for (const name of ['contactName', 'businessName', 'town'] as const) if (!data[name]) errors[name] = `Please enter your ${labels[name].toLowerCase()}.`;
  if (data.town && !(towns as readonly string[]).includes(data.town)) errors.town = 'Please select Bailey, Conifer, or Evergreen.';
  if (!data.phone && !data.email) errors.phone = 'Please provide a phone number or email address so we can contact you.';
  if (data.phone && (!/^[+\d().\s-]+$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 10 || data.phone.replace(/\D/g, '').length > 15)) errors.phone = 'Please enter a phone number with 10 to 15 digits.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';
  const enums = { businessType: businessTypes, squareFootage: sizes, frequency: frequencies, preferredContact: contactMethods };
  for (const [name, choices] of Object.entries(enums)) if (data[name as InquiryField] && !choices.includes(data[name as InquiryField])) errors[name as InquiryField] = 'Please choose one of the listed options.';
  if (data.preferredContact === 'Phone' && !data.phone) errors.phone = 'Please provide a phone number for your preferred contact method.';
  if (data.preferredContact === 'Email' && !data.email) errors.email = 'Please provide an email address for your preferred contact method.';
  for (const name of fieldNames) {
    const limit = name === 'message' ? 2000 : name === 'businessAddress' ? 300 : 150;
    if (data[name].length > limit) errors[name] = `Please keep this field to ${limit} characters or fewer.`;
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(data[name])) errors[name] = 'Please remove unsupported characters.';
  }
  return { data, errors };
}
