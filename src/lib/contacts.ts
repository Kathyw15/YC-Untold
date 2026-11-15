import * as Contacts from "expo-contacts/legacy";

import { CAST, CHLOE_PHONE, CIRCLES, KATHY_PHONE } from "@/convex/demoCast";

import { DIAL_PREFIX, toE164 } from "./phone";

export type DeviceContact = { name: string; phone: string; emoji?: string };
export type ContactsAccess = "undetermined" | "granted" | "denied";

export const SYNC_BATCH_SIZE = 500;

// The sample contacts of the signed-in demo account: the other demo account, the seeded friends in their
// circle, and a few people who are not on Seal. Any other account gets both demo accounts and every friend.
export function sampleContactsFor(myPhone: string | undefined): DeviceContact[] {
  const circle = myPhone ? CIRCLES[myPhone] : undefined;
  const friends = CAST.filter((member) => !circle || circle.friends.includes(member.key));
  return [
    { name: "Chloe", phone: CHLOE_PHONE },
    { name: "Kathy", phone: KATHY_PHONE },
    ...friends.map((member) => ({ name: member.contactName, phone: member.phone })),
    ...(circle?.notOnSeal ?? [{ name: "Grandma Rose", phone: "+12015550104" }]),
  ];
}

export async function getContactsAccess(): Promise<ContactsAccess> {
  return (await Contacts.getPermissionsAsync()).status;
}

export async function requestContactsAccess(): Promise<ContactsAccess> {
  return (await Contacts.requestPermissionsAsync()).status;
}

export async function readDeviceContacts(): Promise<DeviceContact[]> {
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
  const byPhone = new Map<string, DeviceContact>();
  for (const contact of data) {
    for (const entry of contact.phoneNumbers ?? []) {
      const phone = entry.number ? toE164(entry.number) : null;
      if (!phone || !phone.startsWith(DIAL_PREFIX) || byPhone.has(phone)) continue;
      byPhone.set(phone, { name: contact.name?.trim() || phone, phone });
    }
  }
  return [...byPhone.values()].sort((a, b) => a.name.localeCompare(b.name));
}
