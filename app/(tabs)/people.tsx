import { useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, Pressable, SectionList, StyleSheet, View } from "react-native";

import { BreathingButton } from "@/components/BreathingButton";
import { ContactAvatar } from "@/components/ContactAvatar";
import { ContactsPermissionAlert } from "@/components/ContactsPermissionAlert";
import { IconButton } from "@/components/IconButton";
import { QuietLink } from "@/components/QuietLink";
import { Rise } from "@/components/Rise";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CHLOE_PHONE, KATHY_PHONE } from "@/convex/demoCast";
import {
  type ContactsAccess,
  type DeviceContact,
  getContactsAccess,
  readDeviceContacts,
  requestContactsAccess,
  sampleContactsFor,
  SYNC_BATCH_SIZE,
} from "@/lib/contacts";
import { colors, layout, radius, shadows, space } from "@/theme";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "1";
// Demo mode and the web have no device contacts: an in-app copy of the system alert stands in for the real one.
const FAKE_CONTACTS = DEMO_MODE || Platform.OS === "web";
const FINDING_MS = 900;
const INDEX = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

export default function PeopleScreen() {
  const router = useRouter();
  const { hint } = useLocalSearchParams<{ hint?: string }>();
  const myPhone = useUser().user?.primaryPhoneNumber?.phoneNumber;
  const sync = useMutation(api.contacts.sync);
  const markRead = useMutation(api.notices.markRead);
  const synced = useQuery(api.contacts.listMatched);
  const matched = synced ?? [];
  const sent = useQuery(api.direct.listSent) ?? [];
  const matches = useQuery(api.matches.list) ?? [];
  const notices = (useQuery(api.notices.list) ?? []).filter((notice) => notice.kind === "sealedReceived");

  const [access, setAccess] = useState<ContactsAccess | "checking">("checking");
  const [asking, setAsking] = useState(false);
  const [alert, setAlert] = useState(false);
  const [notNow, setNotNow] = useState(false);
  const [contacts, setContacts] = useState<DeviceContact[] | null>(null);
  const [contactIds, setContactIds] = useState<Record<string, Id<"contacts">> | null>(null);

  async function bring(list: DeviceContact[], delay = 0) {
    setContacts(list);
    setContactIds(null);
    const ids: Record<string, Id<"contacts">> = {};
    try {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      for (let start = 0; start < list.length; start += SYNC_BATCH_SIZE) {
        const batch = list.slice(start, start + SYNC_BATCH_SIZE).map((contact) => contact.phone);
        for (const synced of await sync({ phones: batch })) ids[synced.phone] = synced.contactId;
      }
    } finally {
      setContactIds(ids);
    }
  }

  // Whether this account has said yes to the copy of the alert: its contacts are on the server until a demo reset.
  const allowed = synced === undefined ? null : synced.length > 0;
  useEffect(() => {
    if (!FAKE_CONTACTS || allowed === null || !myPhone) return;
    if (allowed) {
      if (contacts === null) void bring(sampleContactsFor(myPhone));
      return;
    }
    setContacts(null);
    setContactIds(null);
    setAccess((current) => (current === "denied" ? current : "undetermined"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, myPhone]);

  useEffect(() => {
    if (FAKE_CONTACTS) return;
    void getContactsAccess().then(async (status) => {
      setAccess(status);
      if (status === "granted") await bring(await readDeviceContacts());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onContinue() {
    if (FAKE_CONTACTS) return setAlert(true);
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
      params: person
        ? { phone: person.phone, name: person.name, here: here ? "1" : "0", ...(person.emoji ? { emoji: person.emoji } : {}) }
        : {},
    });
  }

  const onSeal = new Map(matched.map((person) => [person.contactId, person]));
  const sealOrder = new Map<string, number>();
  sent.forEach((entry, index) => {
    if (entry.contactId && !sealOrder.has(entry.contactId)) sealOrder.set(entry.contactId, index + 1);
  });
  const talkedWith = new Set(matches.map((match) => match.other?.id).filter(Boolean));
  const everyone = (contacts ?? [])
    .filter((contact) => contact.phone !== myPhone)
    .map((contact) => {
      const contactId = contactIds?.[contact.phone] as Id<"contacts"> | undefined;
      const person = contactId ? onSeal.get(contactId) : undefined;
      return {
        ...contact,
        person,
        rank:
          FAKE_CONTACTS && (contact.phone === CHLOE_PHONE || contact.phone === KATHY_PHONE)
            ? -1
            : person && talkedWith.has(person.userId)
              ? 0
              : ((contactId && sealOrder.get(contactId)) ?? null),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  type Entry = (typeof everyone)[number];
  const closeFriends = everyone
    .filter((entry) => entry.rank !== null)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, 6);
  const sections: { title: string; data: Entry[] }[] = [];
  for (const entry of everyone) {
    const first = entry.name.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    const section = sections.find((candidate) => candidate.title === letter);
    if (section) section.data.push(entry);
    else sections.push({ title: letter, data: [entry] });
  }

  function open(entry: Entry) {
    if (!entry.person) return writeTo(entry, false);
    router.push({ pathname: "/person/[id]", params: { id: entry.person.userId, name: entry.name, phone: entry.phone } });
  }

  const title = (
    <View style={styles.titleRow}>
      <Text accessibilityRole="header" style={styles.title}>
        People
      </Text>
      <IconButton icon="people-outline" label="Write to a phone number" onPress={() => writeTo()} testID="people-add" />
    </View>
  );

  const top = (
    <View>
      <View style={styles.search} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name="search" size={19} color="#8A8A93" />
        <Text style={styles.searchText}>Search contacts</Text>
      </View>
      {notices.length > 0 ? (
        <Rise>
          <Pressable
            testID="sealed-notice"
            accessibilityRole="button"
            onPress={() => router.push("/notice")}
            style={({ pressed }) => [styles.notice, pressed && styles.pressed]}>
            <View style={styles.noticeBadge}>
              <Ionicons name="mail-outline" size={22} color={colors.white} />
            </View>
            <View style={styles.fill}>
              <Text variant="row">Someone left you a Seal.</Text>
              <Text soft style={styles.noticeSub}>
                Tap to learn what this means
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
          </Pressable>
        </Rise>
      ) : null}
      {hint ? (
        <View style={styles.hint} testID="people-hint">
          <Ionicons name="sparkles" size={16} color={colors.white} />
          <Text style={styles.hintText}>Pick the person you want to say something to.</Text>
        </View>
      ) : null}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {contacts !== null ? (
        <QuietLink testID="write-to-number" label="Write to a phone number" onPress={() => writeTo()} />
      ) : null}
      {__DEV__ && !DEMO_MODE ? (
        <QuietLink testID="load-sample-contacts" label="Load sample contacts (dev)" onPress={() => void bring(sampleContactsFor(myPhone))} />
      ) : null}
    </View>
  );

  if (contacts !== null && contactIds !== null && everyone.length > 0) {
    return (
      <Screen scene="base" aboveTabBar testID="people-screen" contentStyle={styles.screen}>
        {title}
        <View style={styles.fill}>
        <SectionList
          testID="people-list"
          initialNumToRender={40}
          sections={sections}
          keyExtractor={(contact) => contact.phone}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {top}
              {closeFriends.length > 0 ? (
                <View>
                  <Text variant="heading" style={styles.sectionTitle}>
                    Close Friends
                  </Text>
                  <View style={styles.grid} testID="close-friends">
                    {closeFriends.map((entry) => (
                      <Pressable
                        key={entry.phone}
                        testID={"close-friend-" + entry.phone}
                        accessibilityRole="button"
                        accessibilityLabel={entry.name}
                        onPress={() => open(entry)}
                        style={({ pressed }) => [styles.friend, pressed && styles.pressed]}>
                        <ContactAvatar
                          uri={entry.person?.avatarUrl}
                          emoji={entry.person ? entry.person.avatarEmoji : entry.emoji}
                          name={entry.name}
                          size={100}
                        />
                        <Text numberOfLines={1} style={styles.friendName}>
                          {entry.name.split(" ")[0]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              <Text variant="heading" style={styles.sectionTitle}>
                All Contacts
              </Text>
            </View>
          }
          ListFooterComponent={footer}
          renderSectionHeader={({ section }) => <Text style={styles.letter}>{section.title}</Text>}
          renderItem={({ item, index }) => (
            <Pressable
              testID={"person-" + item.phone}
              accessibilityRole="button"
              accessibilityLabel={"Write to " + item.name}
              onPress={() => open(item)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              {index > 0 ? <View style={styles.rowLine} /> : null}
              <ContactAvatar
                uri={item.person?.avatarUrl}
                emoji={item.person ? item.person.avatarEmoji : item.emoji}
                name={item.name}
                size={44}
              />
              <View style={styles.fill}>
                <Text numberOfLines={1} style={styles.rowName}>
                  {item.name}
                </Text>
                {item.person ? null : (
                  <Text soft numberOfLines={1} style={styles.rowSub}>
                    Not on Seal yet
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        />
        <View style={styles.index} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {INDEX.map((letter) => (
            <Text key={letter} style={styles.indexLetter}>
              {letter}
            </Text>
          ))}
        </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scene="base" aboveTabBar testID="people-screen">
      {title}
      {top}
      {contacts === null && access === "undetermined" && !notNow ? (
        <View style={styles.empty} testID="contacts-invitation">
          <View style={styles.emptyBadge}>
            <Ionicons name="people-outline" size={40} color={colors.ink2} />
          </View>
          <Text style={styles.emptyTitle}>See who’s here</Text>
          <Text soft style={styles.emptyBody}>
            Allow contacts to find friends on Seal and write to them. Home still works without it.
          </Text>
          <View style={styles.emptyAction}>
            <BreathingButton testID="contacts-continue" label="Allow contacts" onPress={onContinue} disabled={asking || alert} />
          </View>
          <QuietLink testID="contacts-not-now" label="Not now" onPress={() => setNotNow(true)} disabled={asking || alert} />
        </View>
      ) : contacts === null && access !== "denied" && !notNow ? (
        <View style={styles.fill} />
      ) : contactIds === null && contacts !== null ? (
        <View style={styles.finding}>
          <Text variant="quote" soft>
            Finding the people you know.
          </Text>
        </View>
      ) : (
        <View style={styles.empty} testID="people-empty">
          <View style={styles.emptyBadge}>
            <Ionicons name="people-outline" size={40} color={colors.ink2} />
          </View>
          <Text style={styles.emptyTitle}>{contacts !== null ? "No one is here yet" : "See who’s here"}</Text>
          <Text soft style={styles.emptyBody}>
            {contacts !== null
              ? "None of your contacts have a US number we can reach."
              : "Allow contacts to find friends on Seal and write to them. Home still works without it."}
          </Text>
          {contacts === null && access === "denied" ? (
            <View style={styles.emptyAction}>
              <BreathingButton
                testID="contacts-settings"
                label="Allow contacts in Settings"
                onPress={() => (FAKE_CONTACTS ? setAccess("undetermined") : void Linking.openSettings())}
              />
            </View>
          ) : null}
          {contacts === null && notNow && access === "undetermined" ? (
            <View style={styles.emptyAction}>
              <BreathingButton testID="contacts-reconsider" label="Allow contacts" onPress={() => setNotNow(false)} />
            </View>
          ) : null}
          {contacts === null ? (
            <QuietLink testID="write-to-number" label="Write to a phone number" onPress={() => writeTo()} />
          ) : null}
        </View>
      )}
      {footer}
      <ContactsPermissionAlert
        visible={alert}
        onAllow={() => {
          setAlert(false);
          setAccess("granted");
          void bring(sampleContactsFor(myPhone), FINDING_MS);
        }}
        onDeny={() => {
          setAlert(false);
          setAccess("denied");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  fill: { flex: 1 },
  pressed: { opacity: 0.6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  title: { fontSize: 40, lineHeight: 44, fontWeight: "900", fontStyle: "italic", letterSpacing: -1.6, paddingRight: 6 },
  list: { marginHorizontal: -layout.screenPadding },
  listContent: { paddingHorizontal: layout.screenPadding, paddingBottom: 130 },
  search: {
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "#EBEBF0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  searchText: { color: "#8A8A93" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.list,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.62)",
    boxShadow: shadows.card,
  },
  noticeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  noticeSub: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.field,
    backgroundColor: colors.ink,
  },
  hintText: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "500", color: colors.white },
  sectionTitle: { marginTop: 26, marginBottom: 12, marginHorizontal: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 20, marginTop: 4 },
  friend: { width: "33.33%", alignItems: "center" },
  friendName: { fontSize: 16, lineHeight: 21, fontWeight: "500", marginTop: 8 },
  letter: { fontSize: 15, lineHeight: 20, fontWeight: "700", color: colors.ink2, marginTop: 16, marginBottom: 4, marginHorizontal: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 9, paddingHorizontal: 4 },
  rowLine: { position: "absolute", left: 62, right: 0, top: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  rowName: { fontWeight: "500" },
  rowSub: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  index: { position: "absolute", right: -17, top: 150, alignItems: "center" },
  indexLetter: { fontSize: 10, lineHeight: 14.2, fontWeight: "600", color: colors.blue },
  footer: { gap: space.xs, paddingTop: space.lg },
  finding: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", paddingTop: 40, paddingHorizontal: 16 },
  emptyBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: colors.white,
    boxShadow: shadows.card,
  },
  emptyTitle: { fontSize: 24, lineHeight: 28, fontWeight: "700", letterSpacing: -0.48, textAlign: "center", marginTop: 10, marginBottom: 8 },
  emptyBody: { textAlign: "center", marginBottom: 14 },
  emptyAction: { alignSelf: "stretch" },
});
