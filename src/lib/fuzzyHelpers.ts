// Helper utilities for fuzzy matching. Keep these out of server modules so they
// can remain synchronous and testable.
export const normalizeForSearch = (s: string) => (s ?? '').toLowerCase().replace(/[^a-z]/g, '');

export const levenshteinDistance = (a: string, b: string) => {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const v0 = new Array(bl + 1);
  const v1 = new Array(bl + 1);
  for (let i = 0; i <= bl; i++) v0[i] = i;
  for (let i = 0; i < al; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < bl; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= bl; j++) v0[j] = v1[j];
  }
  return v1[bl];
};

export const isNormalizedCloseMatch = (candidate: string, term: string) => {
  const normTop = normalizeForSearch(candidate);
  const normTerm = normalizeForSearch(term);
  const maxLen = Math.max(normTop.length || 1, normTerm.length || 1);
  const dist = levenshteinDistance(normTop, normTerm);
  const ratio = dist / maxLen;
  const isSubsequence = (shorter: string, longer: string) => {
    if (!shorter) return true;
    let i = 0;
    for (let j = 0; j < longer.length && i < shorter.length; j++) {
      if (shorter[i] === longer[j]) i++;
    }
    return i === shorter.length;
  };
  return (
    normTop === normTerm
    || normTop.startsWith(normTerm)
    || normTop.includes(normTerm)
    || normTerm.startsWith(normTop)
    || dist <= 2
    || ratio <= 0.3
    || isSubsequence(normTerm, normTop)
    || isSubsequence(normTop, normTerm)
  );
};
