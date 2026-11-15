// Kathy's fixed set of 30 conversation stickers. A conversation gets one, picked by its shared theme;
// the title is shown as text in the app. The pictures are bundled with the app under assets/stickers.
export const STICKERS = [
  { key: "we-talked", title: "We Talked", keywords: [] },
  { key: "peace", title: "Made Peace", keywords: ["reconcil","cold war","peace","truce","made up","forgiv","argument","fight"] },
  { key: "cherries", title: "Sweet Memories", keywords: ["memor","nostalg","remember when","childhood","used to"] },
  { key: "bandage", title: "The Patch-Up", keywords: ["hurt","repair","heal","mend","patch","wound"] },
  { key: "wave", title: "The Deep Talk", keywords: ["deep","emotion","ups and downs","overwhelm","vulnerab"] },
  { key: "heart", title: "Closer Now", keywords: ["closer","affection","gratitude","grateful","love","care","appreciat"] },
  { key: "news", title: "Big News", keywords: ["announce","news","life update","engaged","new job"] },
  { key: "sunset", title: "Slow Sundays", keywords: ["slow","hometown","back home","grew up","routine","sunday"] },
  { key: "picnic", title: "Summer Plans", keywords: ["outing","outdoor","picnic","park","summer"] },
  { key: "coffee", title: "The Catch-Up", keywords: ["catch up","catching up","long time","coffee","been a while"] },
  { key: "laptop", title: "Work Talk", keywords: ["work","career","job","pressure","burnout","boss","deadline"] },
  { key: "headphones", title: "Same Song", keywords: ["music","song","hobby","taste","band","playlist","mixtape"] },
  { key: "apology", title: "The Apology", keywords: ["apolog","sorry","regret","shouldn't have","yelled"] },
  { key: "handshake", title: "Second Chance", keywords: ["start over","starting over","second chance","another chance","try again"] },
  { key: "two-people", title: "Reconnected", keywords: ["reconnect","drifted","lost touch","grew apart","friendship"] },
  { key: "party-popper", title: "Celebration", keywords: ["celebrat","congrat","achiev","proud of you","promotion"] },
  { key: "grad-cap", title: "College Days", keywords: ["school","college","student","university","dorm","graduat"] },
  { key: "plane", title: "Miles Apart", keywords: ["distance","travel","moving away","moved","far away","miles","abroad","goodbye"] },
  { key: "camera", title: "Old Photos", keywords: ["photo","picture","snapshot","remembering a moment"] },
  { key: "mountains", title: "The Big Climb", keywords: ["hard time","got through","struggle","tough","difficult","surviv"] },
  { key: "tent", title: "Road Trip Stories", keywords: ["adventure","trip","camping","hike"] },
  { key: "fire", title: "Fired Up", keywords: ["passion","encourag","support","believe in","motivat"] },
  { key: "sleepy-moon", title: "Late Night Talks", keywords: ["late night","late-night","insomnia","3am","can't sleep","midnight"] },
  { key: "sparkles", title: "Little Wins", keywords: ["small joy","small win","little win","progress","small kindness"] },
  { key: "megaphone", title: "The Honest One", keywords: ["confess","finally say","admit","never told","honest","too proud"] },
  { key: "sealed-envelope", title: "The Letter", keywords: ["letter","unsaid","never said","wrote"] },
  { key: "beers", title: "Cheers", keywords: ["drink","beer","hang out","hanging out","cheers"] },
  { key: "cake", title: "Birthday Wishes", keywords: ["birthday","anniversar"] },
  { key: "gift", title: "The Thank-You", keywords: ["thank","gift","present"] },
  { key: "calendar", title: "Let's Make Plans", keywords: ["plan","commit","schedule","promise"] },
] as const;

export type StickerKey = (typeof STICKERS)[number]["key"];

function hits(text: string, keyword: string) {
  return text.split(keyword).length - 1;
}

export function pickSticker(theme: string, words: string) {
  const inTheme = theme.toLowerCase();
  const inWords = words.toLowerCase();
  let best: (typeof STICKERS)[number] = STICKERS[0];
  let bestScore = 0;
  for (const sticker of STICKERS) {
    let score = 0;
    for (const keyword of sticker.keywords) score += 3 * hits(inTheme, keyword) + hits(inWords, keyword);
    if (score > bestScore) {
      best = sticker;
      bestScore = score;
    }
  }
  return { key: best.key, title: best.title };
}
