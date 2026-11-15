// The seeded friends of the demo world. The app's sample contacts and the demo reset both read this.
// Phone numbers are Clerk test numbers, so they never reach a real person.

export type CastMember = {
  key: string;
  name: string;
  contactName: string;
  phone: string;
  emoji?: string;
  image?: string;
};

export const CAST: CastMember[] = [
  { key: "maya", name: "Maya", contactName: "Maya Lindqvist", phone: "+12015550102", image: "maya.jpg" },
  { key: "jordan", name: "Jordan", contactName: "Jordan Bell", phone: "+12015550103", image: "jordan.jpg" },
  { key: "theo", name: "Theo", contactName: "Theo", phone: "+12015550105", image: "theo.jpg" },
  { key: "priya", name: "Priya", contactName: "Priya Raman", phone: "+12015550106", image: "priya.jpg" },
  { key: "jonah", name: "Jonah", contactName: "Jonah Reyes", phone: "+12015550107", emoji: "\u{1F335}" },
  { key: "iris", name: "Iris", contactName: "Iris Okafor", phone: "+12015550108" },
  { key: "sam", name: "Sam", contactName: "Sam Whitaker", phone: "+12015550109", image: "sam.jpg" },
  { key: "taylor", name: "Taylor", contactName: "Taylor Brooks", phone: "+12015550110", emoji: "\u{1F996}" },
  { key: "mom", name: "Mom", contactName: "Mom", phone: "+12015550123", image: "mom.jpg" },
];

export const CHLOE_PHONE = "+12015550100";
export const KATHY_PHONE = "+12015550101";

type Circle = { friends: string[]; notOnSeal: { name: string; phone: string; emoji?: string }[] };

// Who each demo account has in their contacts: the seeded friends they know, and a few people not on Seal.
export const CIRCLES: Record<string, Circle> = {
  [CHLOE_PHONE]: {
    friends: ["maya", "jordan", "theo", "priya", "jonah"],
    notOnSeal: [
      { name: "Grandma Rose", phone: "+12015550104", emoji: "\u{1F339}" },
      { name: "Auntie Mei", phone: "+12015550121" },
      { name: "Dev (climbing gym)", phone: "+12015550122", emoji: "\u{1F9D7}" },
    ],
  },
  [KATHY_PHONE]: {
    friends: ["maya", "theo", "iris", "sam", "taylor", "mom"],
    notOnSeal: [
      { name: "Nana June", phone: "+12015550126", emoji: "\u{1F490}" },
      { name: "Coach Dana", phone: "+12015550124" },
      { name: "Leo (landlord)", phone: "+12015550125", emoji: "\u{1F511}" },
    ],
  },
};
