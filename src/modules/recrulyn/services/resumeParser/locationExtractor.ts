/**
 * locationExtractor.ts
 * Detects candidate location from the top / contact-info region of the
 * resume. Uses a known city/state gazetteer to boost confidence plus a
 * generic "City, State/Country" pattern as fallback.
 */

const KNOWN_LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Coimbatore", "Kochi", "Madurai",
  "Nashik", "Vijayawada", "Trichy", "Tiruchirappalli", "Kumbakonam",
  "Salem", "Erode", "Thanjavur", "Tirunelveli", "Vellore", "Noida",
  "Gurgaon", "Gurugram", "Chandigarh", "Mysore", "Mysuru", "Guwahati",
  "Bhubaneswar", "Dehradun", "Raipur", "Ranchi", "Amritsar", "Jodhpur",
  "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "Telangana",
  "Andhra Pradesh", "Gujarat", "Rajasthan", "Punjab", "Haryana",
  "Uttar Pradesh", "West Bengal", "Bihar", "Odisha", "Madhya Pradesh",
  "New York", "San Francisco", "Seattle", "Austin", "Boston", "Chicago",
  "London", "Toronto", "Vancouver", "Berlin", "Singapore", "Dubai",
  "Sydney", "Melbourne","Trivandrum",
"Kozhikode",
"Kannur",
"Palakkad",
"Hosur",
"Tiruppur",
"Sivakasi",
"Karur",
"Dindigul",
"Kanchipuram",
"Thoothukudi",
"Nagercoil",
"Puducherry",
"Pondicherry",
"Warangal",
"Nellore",
"Guntur",
"Kakinada",
"Rajahmundry",
"Hubli",
"Belgaum",
"Mangalore",
"Dharwad",
"Shimoga",
"Manipal",
"Goa",
"Panaji",
"Bhubaneswar",
"Cuttack",
"Jamshedpur",
"Dhanbad",
"Siliguri",
"Asansol",
];

const KNOWN_LOCATIONS_LOWER = new Set(
  KNOWN_LOCATIONS.map((l) => l.toLowerCase())
);

const CITY_STATE_PATTERN =
  /\b([A-Z][a-zA-Z.]+(?:\s[A-Z][a-zA-Z.]+)?),\s*([A-Z][a-zA-Z.]+(?:\s[A-Z][a-zA-Z.]+)?)\b/g;
const LOCATION_LABEL_PATTERN =
/(?:location|address)\s*[:\-]?\s*([A-Za-z ]+)/i;
const PINCODE_PATTERN =
/([A-Za-z ]+)\s+\d{6}/;

export function extractLocation(text: string): string {
const topRegion = text.split("\n").slice(0, 25).join("\n");
  const candidates: { value: string; score: number }[] = [];

  // Direct gazetteer hits anywhere in the top region.
  for (const location of KNOWN_LOCATIONS) {
    const regex = new RegExp(`\\b${escapeRegex(location)}\\b`, "i");
    if (regex.test(topRegion)) {
      candidates.push({ value: location, score: 10 });
    }
  }
const pin = topRegion.match(
  PINCODE_PATTERN
);

if (pin?.[1]) {

  candidates.push({
    value: pin[1].trim(),
    score: 12,
  });

}
  // Generic "City, State" pattern.
  let match: RegExpExecArray | null;
  const patternText = topRegion;
  CITY_STATE_PATTERN.lastIndex = 0;
  const labelled = topRegion.match(
  LOCATION_LABEL_PATTERN
);

if (labelled?.[1]) {

  candidates.push({
    value: labelled[1].trim(),
    score: 20,
  });

}
  while ((match = CITY_STATE_PATTERN.exec(patternText)) !== null) {
    const [full, part1, part2] = match;
    let score = 3;
    const part1Known = KNOWN_LOCATIONS_LOWER.has(part1.toLowerCase());
    const part2Known = KNOWN_LOCATIONS_LOWER.has(part2.toLowerCase());
    if (part1Known) score += 6;
    if (part2Known) score += 6;
    candidates.push({ value: full, score });
  }

  if (candidates.length === 0) return "";
const unique = new Map<
  string,
  number
>();

for (const c of candidates) {

  const existing =
    unique.get(c.value);

  if (
    existing === undefined ||
    c.score > existing
  ) {
    unique.set(
      c.value,
      c.score
    );
  }

}

candidates.length = 0;

unique.forEach(
  (score, value) => {

    candidates.push({
      value,
      score,
    });

  }
);
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].value;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}