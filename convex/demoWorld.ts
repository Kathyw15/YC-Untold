// Everything "npx convex run devSeed:resetDemo" writes: the Social feed and the history each demo account
// starts with. People are named by their key in demoCast.ts.

import { CHLOE_PHONE, KATHY_PHONE } from "./demoCast";

type FeedQuestion = {
  key: string;
  by: string;
  text: string;
  tags: string[];
  answer: string;
  responses: number;
  photo?: string;
};

// TIMELY QUESTIONS. Swap these for whatever is in the news on demo day, then run the reset again.
// Keep the keys, and keep each answer personal so a sincere reply can resonate with it.
export const TIMELY_QUESTIONS: FeedQuestion[] = [
  {
    key: "timely-1",
    by: "jordan",
    text: "Why do you think Jensen Huang left?",
    tags: ["Work"],
    answer:
      "My guess is that he was simply tired. I keep thinking about how hard it must be to walk away from the thing that made you who you are, and whether I would be brave enough to do it.",
    responses: 5,
  },
  {
    key: "timely-2",
    photo: "plane",
    by: "maya",
    text: "What do you make of the FAA grounding all those flights?",
    tags: [],
    answer:
      "I was stuck at the gate for six hours and ended up talking to a stranger about her mother the entire time. Strangely, it was the best conversation I have had all month.",
    responses: 3,
  },
];

// The Social feed, top of the list first.
export const FEED: FeedQuestion[] = [
  {
    key: "chocolate",
    by: "taylor",
    text: "What do we think about chocolate?",
    tags: [],
    answer:
      "Dark chocolate is a personality test and I fail it happily. Give me the cheap milk kind my grandpa kept in his coat pocket. It tastes like being seven and adored.",
    responses: 6,
  },
  {
    key: "proud",
    photo: "alone",
    by: "maya",
    text: "Have you ever missed someone but felt too proud to reach out?",
    tags: ["Friendship"],
    answer:
      "Yes. My brother and I stopped talking after our dad's birthday. I have typed the first line a dozen times and deleted it every time.",
    responses: 4,
  },
  TIMELY_QUESTIONS[0],
  {
    key: "pigeons",
    by: "jonah",
    text: "What is the most unhinged thing you believe about pigeons?",
    tags: [],
    answer:
      "That they remember faces, and one in my neighbourhood has decided I am family. I say good morning to him. I would be genuinely sad if he moved away.",
    responses: 3,
  },
  {
    key: "kindness",
    photo: "friends",
    by: "priya",
    text: "What is a small kindness someone did for you that they have probably forgotten?",
    tags: ["Growing up"],
    answer:
      "My neighbour left soup on my doormat the week I moved in and never mentioned it. I was lonelier than I let anyone know, and that soup is why I stayed.",
    responses: 2,
  },
  {
    key: "chore",
    by: "sam",
    text: "Which household chore would you outlaw?",
    tags: [],
    answer:
      "Folding fitted sheets. Nobody taught me, I am too proud to look it up, and every time I ball one up I think of my mom doing it perfectly without looking.",
    responses: 4,
  },
  {
    key: "yourself",
    by: "theo",
    text: "Where do you go when you need to feel like yourself again?",
    tags: [],
    answer: "The long way home along the river, with my phone in my bag. Twenty minutes and I can hear myself think.",
    responses: 5,
  },
  TIMELY_QUESTIONS[1],
  {
    key: "nineteen",
    photo: "golden",
    by: "iris",
    text: "What did you believe at nineteen that you no longer believe?",
    tags: ["Growing up"],
    answer: "That being needed and being loved were the same thing. It took me years to tell them apart.",
    responses: 3,
  },
  {
    key: "hill",
    photo: "grass",
    by: "priya",
    text: "What is a hill you will die on that matters to absolutely no one?",
    tags: [],
    answer:
      "Soup is a meal. I will not be taking questions. My dad made soup every Sunday and called it dinner, and he was right.",
    responses: 2,
  },
  {
    key: "thank-you",
    by: "sam",
    text: "Who do you owe a thank-you that is years overdue?",
    tags: ["Growing up"],
    answer:
      "My high school art teacher. She let me eat lunch in her classroom for a whole year and never once asked why. I think she knew.",
    responses: 1,
  },
  {
    key: "song",
    by: "theo",
    text: "What song do you skip when other people are in the car?",
    tags: [],
    answer:
      "Anything from the playlist I made the summer after my breakup. Alone, I turn it all the way up. It still gets me, in a good way.",
    responses: 1,
  },
  {
    key: "pretend",
    by: "jordan",
    text: "What is something you pretend not to care about?",
    tags: ["Friendship"],
    answer:
      "Whether my friends would notice if I stopped being the one who texts first. I act easygoing about it. I am not.",
    responses: 0,
  },
  {
    key: "second-chances",
    by: "jonah",
    text: "Do people deserve second chances?",
    tags: [],
    answer: "Yes, because I've made mistakes I wish I could undo, and someone once gave me room to try again.",
    responses: 2,
  },
];

type Talk = {
  with: string;
  // A feed question key makes this a conversation that grew out of two answers; without it, out of two Seals.
  question?: string;
  mine: string;
  theirs?: string;
  theme: string;
  open: boolean;
  chat: ["me" | "them", string][];
};

type Owner = {
  key: string;
  name: string;
  phone: string;
  asked: { text: string; tags: string[]; answer: string; responses: number }[];
  // Seals still waiting for an answer. "to" is a cast key, or a phone number for someone not on Seal.
  waiting: { to: string; body: string }[];
  answered: { question: string; body: string }[];
  talks: Talk[];
};

export const OWNERS: Owner[] = [
  {
    key: "chloe",
    name: "Chloe",
    phone: CHLOE_PHONE,
    asked: [
      {
        text: "What is the last thing that made you feel lucky?",
        tags: [],
        answer: "My sister calling just to tell me about a dog she saw. No reason at all. I felt chosen.",
        responses: 1,
      },
      {
        text: "What were you certain about at 22 that you have quietly changed your mind on?",
        tags: ["Growing up"],
        answer:
          "That needing people was a weakness. I built a whole personality around being low maintenance, and it was lonely in there.",
        responses: 3,
      },
    ],
    waiting: [
      {
        to: "theo",
        body: "I am sorry I went quiet after your show. I was jealous of how brave you were, and it had nothing to do with you.",
      },
      {
        to: "+12015550104",
        body: "I kept the recipe card with your handwriting on it. I am afraid to cook from it in case I get it wrong.",
      },
      { to: "jonah", body: "You were right about the job. I wish I had listened when you said it gently." },
    ],
    answered: [
      { question: "chore", body: "Emptying the dishwasher. I will happily wash everything by hand to avoid it." },
      {
        question: "second-chances",
        body: "Mostly yes. The friend who forgave me at seventeen is the reason I believe it.",
      },
    ],
    talks: [
      {
        with: "maya",
        question: "proud",
        mine: "Yes. My cousin Lena. We were inseparable until I moved away, and I let one missed birthday turn into two silent years.",
        theme: "Missing someone and being too proud to say so",
        open: false,
        chat: [
          ["them", "I can't believe it was you. I almost didn't answer that one."],
          ["me", "Same. I typed mine three times."],
          ["them", "Did you ever message Lena?"],
          ["me", "Last night. She replied with a voice note and I cried in the kitchen."],
        ],
      },
      {
        with: "jordan",
        mine: "I never thanked you properly for driving four hours when my dad was in the hospital. I think about it more than you know.",
        theirs:
          "The week your dad was sick was when I realised you are family to me. I have been scared that was too much to say.",
        theme: "Gratitude that went unsaid on both sides",
        open: false,
        chat: [
          ["them", "So we both sat on that for two years."],
          ["me", "Apparently we are both terrible at this."],
          ["them", "Dinner soon? I'll drive. Shorter trip this time."],
          ["me", "Deal. I'm buying."],
        ],
      },
      {
        with: "priya",
        question: "kindness",
        mine: "A woman at the bus stop handed me her umbrella in a downpour on the morning of my first job interview, and walked off into the rain. I think of her every time it pours.",
        theme: "Small kindnesses from near-strangers that stayed",
        open: true,
        chat: [
          ["them", "The umbrella! That one got me."],
          ["me", "Your soup story did the same to me. Did you ever tell your neighbour?"],
          ["them", "Not yet. Maybe this is the push."],
        ],
      },
    ],
  },
  {
    key: "kathy",
    name: "Kathy",
    phone: KATHY_PHONE,
    asked: [
      {
        text: "What would you do with one completely unplanned Saturday?",
        tags: [],
        answer: "Take the first train out, get off wherever looks green, and eat lunch somewhere with no reviews.",
        responses: 2,
      },
      {
        text: "What is a compliment you still remember years later?",
        tags: ["Growing up"],
        answer:
          "A stranger on a train told me I laughed like I meant it. I was twenty and convinced I was too much. I have never forgotten it.",
        responses: 4,
      },
    ],
    waiting: [
      {
        to: "taylor",
        body: "I was hurt that you did not invite me to the lake, and instead of saying so I just got busy. I miss you.",
      },
      {
        to: "+12015550123",
        body: "I understand now why you worked so much. I wish I had been kinder about it when I was sixteen.",
      },
      {
        to: "maya",
        body: "Thank you for covering for me that week at work. I never told you what was really going on.",
      },
    ],
    answered: [
      {
        question: "nineteen",
        body: "That everyone else had been handed a manual. It turns out we are all guessing, and that is oddly comforting.",
      },
      {
        question: "chocolate",
        body: "White chocolate deserves an apology from all of us. My grandmother kept a bar in the freezer and broke off one square a night.",
      },
    ],
    talks: [
      {
        with: "iris",
        mine: "I am sorry I skipped your going-away party. I told you I was sick. I was not. I just could not stand to say goodbye.",
        theirs: "I knew you were not sick. I was never angry. I only wished you had let me hug you before I left.",
        theme: "A goodbye that both of them avoided",
        open: false,
        chat: [
          ["them", "You are a terrible liar, for the record."],
          ["me", "I know. I am so sorry."],
          ["them", "Come visit in the spring. I will make you say a proper goodbye at the airport."],
          ["me", "Booking it tonight."],
        ],
      },
      {
        with: "theo",
        question: "yourself",
        mine: "The pool at six in the morning, before anyone else is there. Underwater is the only place my head goes quiet.",
        theme: "Finding quiet in a routine nobody else sees",
        open: false,
        chat: [
          ["them", "A fellow early riser. I had no idea."],
          ["me", "Only for the pool. Otherwise I am a menace before nine."],
          ["them", "River walk and then coffee sometime?"],
          ["me", "Yes. After nine."],
        ],
      },
      {
        with: "sam",
        mine: "I miss making zines with you. I still have the stapler you lent me, and I am too embarrassed to bring it back after three years.",
        theirs:
          "I think about our Sunday zine afternoons all the time. I never asked for the stapler back because that would mean we were finished.",
        theme: "A friendship neither of them wanted to call finished",
        open: true,
        chat: [
          ["them", "Keep the stapler. Bring paper."],
          ["me", "Sunday?"],
          ["them", "Sunday."],
        ],
      },
    ],
  },
];
