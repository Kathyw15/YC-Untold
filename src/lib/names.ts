export const NAMELESS = "Someone on Seal";

export function personName(profileName: string | null | undefined, contactName?: string | null) {
  return contactName?.trim() || profileName?.trim() || NAMELESS;
}

export function firstName(name: string) {
  return name === NAMELESS ? name : name.trim().split(" ")[0];
}
