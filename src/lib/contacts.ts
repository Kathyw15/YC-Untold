import * as Contacts from "expo-contacts/legacy";

import { DIAL_PREFIX, toE164 } from "./phone";

export type DeviceContact = { name: string; phone: string };
export type ContactsAccess = "undetermined" | "granted" | "denied";

export const SYNC_BATCH_SIZE = 500;

export const SAMPLE_CONTACTS: DeviceContact[] = [
  { name: "Alex Rivera", phone: "+12015550100" },
  { name: "Sam Okafor", phone: "+12015550101" },
  { name: "Maya Lindqvist", phone: "+12015550102" },
  { name: "Jordan Bell", phone: "+12015550103" },
  { name: "Grandma Rose", phone: "+12015550104" },
  { name: "Theo", phone: "+12015550105" },
];

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
