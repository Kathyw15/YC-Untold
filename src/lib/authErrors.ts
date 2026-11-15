import { isClerkAPIResponseError } from "@clerk/expo";

const messages: Record<string, string> = {
  form_code_incorrect: "That code doesn't match. Try once more.",
  verification_failed: "Too many tries. Ask for a new code.",
  verification_expired: "That code has expired. Ask for a new one.",
  too_many_requests: "Too many tries. Give it a moment.",
  unsupported_country_code: "Untold works with US numbers for now.",
  form_param_format_invalid: "That doesn't look like a US phone number.",
  network_error: "You seem to be offline. Try again in a moment.",
};

export function authErrorCode(error: { code: string }): string {
  return isClerkAPIResponseError(error) ? (error.errors[0]?.code ?? error.code) : error.code;
}

export function describeAuthError(error: { code: string }): string {
  return messages[authErrorCode(error)] ?? "Something went wrong. Please try again.";
}
