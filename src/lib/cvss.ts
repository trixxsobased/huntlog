export type CVSSMetrics = {
  attackVector: "N" | "A" | "L" | "P";
  attackComplexity: "L" | "H";
  privilegesRequired: "N" | "L" | "H";
  userInteraction: "N" | "R";
  scope: "U" | "C";
  confidentiality: "H" | "L" | "N";
  integrity: "H" | "L" | "N";
  availability: "H" | "L" | "N";
};

const V3_1_WEIGHTS = {
  attackVector: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  attackComplexity: { L: 0.77, H: 0.44 },
  privilegesRequired: {
    U: { N: 0.85, L: 0.62, H: 0.27 },
    C: { N: 0.85, L: 0.68, H: 0.5 },
  },
  userInteraction: { N: 0.85, R: 0.68 },
  cia: { H: 0.56, L: 0.22, N: 0 },
};

export function calculateCVSS(metrics: CVSSMetrics): { score: number; vector: string; severity: "None" | "Low" | "Medium" | "High" | "Critical" } {
  // Exploitability Sub-score (ISC)
  const iss = 1 - (
    (1 - V3_1_WEIGHTS.cia[metrics.confidentiality]) *
    (1 - V3_1_WEIGHTS.cia[metrics.integrity]) *
    (1 - V3_1_WEIGHTS.cia[metrics.availability])
  );

  let impact = 0;
  if (metrics.scope === "U") {
    impact = 6.42 * iss;
  } else {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  }

  // Exploitability Score
  const prWeight = V3_1_WEIGHTS.privilegesRequired[metrics.scope][metrics.privilegesRequired];
  const exploitability = 8.22 *
    V3_1_WEIGHTS.attackVector[metrics.attackVector] *
    V3_1_WEIGHTS.attackComplexity[metrics.attackComplexity] *
    prWeight *
    V3_1_WEIGHTS.userInteraction[metrics.userInteraction];

  let score = 0;
  if (impact <= 0) {
    score = 0;
  } else if (metrics.scope === "U") {
    score = Math.min(Math.ceil((impact + exploitability) * 10) / 10, 10);
  } else {
    score = Math.min(Math.ceil((1.08 * (impact + exploitability)) * 10) / 10, 10);
  }

  // Generate Vector String
  const vector = `CVSS:3.1/AV:${metrics.attackVector}/AC:${metrics.attackComplexity}/PR:${metrics.privilegesRequired}/UI:${metrics.userInteraction}/S:${metrics.scope}/C:${metrics.confidentiality}/I:${metrics.integrity}/A:${metrics.availability}`;

  // Determine Severity
  let severity: "None" | "Low" | "Medium" | "High" | "Critical" = "None";
  if (score === 0) severity = "None";
  else if (score >= 0.1 && score <= 3.9) severity = "Low";
  else if (score >= 4.0 && score <= 6.9) severity = "Medium";
  else if (score >= 7.0 && score <= 8.9) severity = "High";
  else if (score >= 9.0 && score <= 10.0) severity = "Critical";

  return { score, vector, severity };
}

// Phase 3: Function to parse CVSS String back to metrics and calculate
export function parseCVSSVector(vectorStr: string): { metrics: CVSSMetrics | null; score: number; severity: "None" | "Low" | "Medium" | "High" | "Critical" } {
  try {
    const parts = vectorStr.trim().split('/');
    if (parts[0] !== 'CVSS:3.1' && parts[0] !== 'CVSS:3.0') return { metrics: null, score: 0, severity: "None" };
    
    const tokenMap: Record<string, string> = {};
    for (let i = 1; i < parts.length; i++) {
        const [key, val] = parts[i].split(':');
        if (key && val) tokenMap[key] = val;
    }

    const metrics: CVSSMetrics = {
        attackVector: (tokenMap['AV'] as CVSSMetrics['attackVector']) || 'N',
        attackComplexity: (tokenMap['AC'] as CVSSMetrics['attackComplexity']) || 'L',
        privilegesRequired: (tokenMap['PR'] as CVSSMetrics['privilegesRequired']) || 'N',
        userInteraction: (tokenMap['UI'] as CVSSMetrics['userInteraction']) || 'N',
        scope: (tokenMap['S'] as CVSSMetrics['scope']) || 'U',
        confidentiality: (tokenMap['C'] as CVSSMetrics['confidentiality']) || 'N',
        integrity: (tokenMap['I'] as CVSSMetrics['integrity']) || 'N',
        availability: (tokenMap['A'] as CVSSMetrics['availability']) || 'N',
    };

    const calculation = calculateCVSS(metrics);
    return { metrics, score: calculation.score, severity: calculation.severity };
  } catch { // Ignore err as we return generic error next line
    return { metrics: null, score: 0, severity: "None" };
  }
}
