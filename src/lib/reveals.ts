const witnessed = new Set<string>();

export function markRevealWitnessed(matchId: string) {
  witnessed.add(matchId);
}

export function hasWitnessedReveal(matchId: string) {
  return witnessed.has(matchId);
}
