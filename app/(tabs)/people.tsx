import { useUser } from "@clerk/expo";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, SectionList, StyleSheet, View } from "react-native";

import { ContactsInvitation } from "@/components/ContactsInvitation";
import { EmptyState } from "@/components/EmptyState";
import { PersonRow } from "@/components/PersonRow";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { SealedNotice } from "@/components/SealedNotice";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  type ContactsAccess,
  type DeviceContact,
  getContactsAccess,
  readDeviceContacts,
  requestContactsAccess,
  SAMPLE_CONTACTS,
  SYNC_BATCH_SIZE,
} from "@/lib/contacts";
import { space } from "@/theme";

export default function PeopleScreen() {
  const router = useRouter();
  const myPhone = useUser().user?.primaryPhoneNumber?.phoneNumber;
  const sync = useMutation(api.contacts.sync);
  const markRead = useMutation(api.notices.markRead);
  const matched = useQuery(api.contacts.listMatched) ?? [];
  const sent = useQuery(api.direct.listSent) ?? [];
  const notices = (useQuery(api.notices.list) ?? []).filter((notice) => notice.kind === "sealedReceived");

  const [access, setAccess] = useState<ContactsAccess | "checking">("checking");
  const [asking, setAsking] = useState(false);
  const [notNow, setNotNow] = useState(false);
  const [contacts, setContacts] = useState<DeviceContact[] | null>(null);
  const [contactIds, setContactIds] = useState<Record<string, Id<"contacts">> | null>(null);

  async function bring(list: DeviceContact[]) {
    setContacts(list);
    setContactIds(null);
    const ids: Record<string, Id<"contacts">> = {};
    try {
      for (let start = 0; start < list.length; start += SYNC_BATCH_SIZE) {
        const batch = list.slice(start, start + SYNC_BATCH_SIZE).map((contact) => contact.phone);
        for (const synced of await sync({ phones: batch })) ids[synced.phone] = synced.contactId;
      }
    } finally {
      setContactIds(ids);
    }
  }

  useEffect(() => {
    void getContactsAccess().then(async (status) => {
      setAccess(status);
      if (status === "granted") await bring(await readDeviceContacts());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onContinue() {
    setAsking(true);
    const status = await requestContactsAccess();
    setAccess(status);
    setAsking(false);
    if (status === "granted") await bring(await readDeviceContacts());
  }

  const unreadIds = notices.filter((notice) => !notice.read).map((notice) => notice.id);
  const unreadRef = useRef(unreadIds);
  useEffect(() => {
    unreadRef.current = unreadIds;
  });
  useFocusEffect(
    useCallback(
      () => () => {
        if (unreadRef.current.length > 0) void markRead({ noticeIds: unreadRef.current });
      },
      [markRead],
    ),
  );

  function writeTo(person?: DeviceContact, here = false) {
    router.push({
      pathname: "/compose/direct",
      params: person ? { phone: person.phone, name: person.name, here: here ? "1" : "0" } : {},
    });
  }

  const onUntold = new Map(matched.map((person) => [person.contactId, person]));
  const sealedFor = new Set(sent.map((entry) => entry.contactId));
  const everyone = (contacts ?? []).filter((contact) => contact.phone !== myPhone);
  const here = everyone.filter((contact) => onUntold.has(contactIds?.[contact.phone] as Id<"contacts">));
  const notHere = everyone.filter((contact) => !here.includes(contact));
  const sections = [
    { key: "here", title: "On Untold", hint: null, data: here },
    {
      key: "not-here",
      title: "Not here yet",
      hint: "You can still write to them. Your words will wait until they arrive.",
      data: notHere,
    },
  ].filter((section) => section.data.length > 0);

  const header = (
    <View style={styles.header}>
      <Rise>
        <Text variant="label" soft>
          People
        </Text>
      </Rise>
      {notices.length > 0 ? <SealedNotice several={notices.length > 1} unread={unreadIds.length > 0} /> : null}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {contacts !== null || notNow || access === "denied" ? (
        <QuietLink testID="write-to-number" label="Write to a phone number" onPress={() => writeTo()} />
      ) : null}
      {contacts === null && notNow && access === "undetermined" ? (
        <QuietLink testID="contacts-reconsider" label="Find people from your contacts" onPress={() => setNotNow(false)} />
      ) : null}
      {contacts === null && access === "denied" ? (
        <QuietLink testID="contacts-settings" label="Turn on contacts in Settings" onPress={() => void Linking.openSettings()} />
      ) : null}
      {__DEV__ || process.env.EXPO_PUBLIC_DEMO_MODE === "1" ? (
        <QuietLink testID="load-sample-contacts" label="Load sample contacts" onPress={() => void bring(SAMPLE_CONTACTS)} />
      ) : null}
    </View>
  );

  if (contacts !== null && contactIds !== null && everyone.length > 0) {
    return (
      <Screen scene="mist" aboveTabBar testID="people-screen">
        <SectionList
          testID="people-list"
          sections={sections}
          keyExtractor={(contact) => contact.phone}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text variant="label" soft>
                {section.title}
              </Text>
              {section.hint ? (
                <Text variant="caption" soft>
                  {section.hint}
                </Text>
              ) : null}
            </View>
          )}
          renderItem={({ item, section }) => {
            const contactId = contactIds[item.phone];
            return (
              <PersonRow
                testID={"person-" + item.phone}
                name={item.name}
                avatarUrl={section.key === "here" ? onUntold.get(contactId)?.avatarUrl : null}
                note={sealedFor.has(contactId) ? "Something of yours is sealed here." : null}
                onPress={() => {
                  const userId = onUntold.get(contactId)?.userId;
                  if (!userId) return writeTo(item, section.key === "here");
                  router.push({ pathname: "/person/[id]", params: { id: userId, name: item.name, phone: item.phone } });
                }}
              />
            );
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scene="mist" aboveTabBar testID="people-screen">
      {header}
      {contacts === null && access === "undetermined" && !notNow ? (
        <ContactsInvitation onContinue={onContinue} onNotNow={() => setNotNow(true)} busy={asking} />
      ) : contacts === null && access !== "denied" && !notNow ? (
        <View style={styles.fill} />
      ) : contactIds === null && contacts !== null ? (
        <View style={styles.finding}>
          <Text variant="quote" soft>
            Finding the people you know.
          </Text>
        </View>
      ) : (
        <EmptyState
          testID="people-empty"
          title="No one is here yet."
          body={
            contacts !== null
              ? "None of your contacts have a US number we can reach."
              : "You can still write to someone if you know their number."
          }
        />
      )}
      {footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.lg, paddingBottom: space.md },
  sectionHeader: { gap: space.xs, paddingTop: space.lg, paddingBottom: space.sm },
  footer: { gap: space.xs, paddingTop: space.lg },
  fill: { flex: 1 },
  finding: { flex: 1, alignItems: "center", justifyContent: "center" },
});
