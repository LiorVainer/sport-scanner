import { message } from './utils/message.utils';

export const RulesContextMessageGenerator = {
    create: (maxPackages: number) =>
        message.user(
            `Generate up to ${maxPackages} valid travel packages from the data above.

Each package must include:
- title, description, startDate, endDate
- a timeline: chronological array of **flight** and **destination** items
- flights include origin/destination, departureDate, purpose (departure, return, connecting), price, ticket link
- destinations must match the city of each match
- total price breakdown: flightsPrice + matchesPrice

📦 Timeline Structure:
- Each **flight** represents a complete flight offer between two cities (e.g. TLV → MUC)
- DO NOT include flight segments as separate timeline items
- Each **destination** should list matches that occur in that specific city only
- Timeline should alternate flights and destinations in order

⚠️ HARD RULES (must follow):
- Start with a flight from user's origin (e.g. TLV)
- End with a return flight to the origin
- Each visited city must have a match
- Flights must arrive **before** any scheduled match kickoff
- Never include matches from different cities in the same destination
- Timeline must be chronological (no backward travel)

✈️ Match Combination Rules:
- 1 match → TLV → match city → TLV (2 flights + 1 destination)
- 2 matches in same city → same as above
- 2 matches in different cities → TLV → city1 → city2 → TLV (3 flights + 2 destinations)

❌ Invalid Examples:
- TLV → Munich → Rome → TLV (if Rome has no match)
- A destination labeled "Barcelona" containing a match from Seville
- Showing TLV → FCO and FCO → MUC as separate flights

✅ Valid Examples:
- TLV → Munich → Leipzig → TLV
- TLV → Barcelona → TLV (with 2 matches in Barcelona)
- TLV → Barcelona → Seville → TLV (if both cities host matches)

Return only complete and rule-abiding packages.
`
        ),
};
