import { AsYouType, type CountryCode, parsePhoneNumberFromString } from "libphonenumber-js/min";

export const DEFAULT_REGION: CountryCode = "US";
export const DIAL_PREFIX = "+1";

export function toE164(input: string, region: CountryCode = DEFAULT_REGION): string | null {
  const parsed = parsePhoneNumberFromString(input, region);
  return parsed?.isValid() ? parsed.number : null;
}

export function nationalToE164(nationalDigits: string): string | null {
  const parsed = parsePhoneNumberFromString(DIAL_PREFIX + nationalDigits);
  return parsed?.isValid() && parsed.countryCallingCode === "1" ? parsed.number : null;
}

export function formatNational(nationalDigits: string): string {
  return new AsYouType(DEFAULT_REGION).input(nationalDigits);
}

export function nextNationalDigits(text: string, previousDigits: string): string {
  const digits = text.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  const erasedOnlyFormatting = digits === previousDigits && text.length < formatNational(previousDigits).length;
  return erasedOnlyFormatting ? digits.slice(0, -1) : digits;
}

export function formatE164(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}
