import { message } from './utils/message.utils';

export const RulesContextMessageGenerator = {
    create: (maxPackages: number) =>
        message.user(
            `Generate up to ${maxPackages} valid travel packages from the data above.

Each package must include:
- title, description, startDate, endDate
- a timeline array: consists of **full flights** and **destination blocks**
- destinations include one or more matches with ticket prices
- flights include origin, destination, departure date, purpose, price, and ticket link
- a total price breakdown (flightsPrice + matchesPrice)

📦 Timeline Structure:
- Timeline is a **chronological array** of 'flight' and 'destination' items
- ✈️ Each flight must represent a **complete flight offer** between cities (e.g. TLV → MUC)
- ❌ DO NOT include individual segments like TLV → FCO and FCO → MUC
- 🛬 Each destination must include at least one match with valid ticket data
- Destinations must reflect actual cities where matches are played

⚠️ HARD RULES (MUST follow):
- Packages must start with a flight from the user's origin (e.g. TLV)
- Packages must end with a return flight to the user's origin (e.g. TLV)
- No flights to cities with no matches
- Each city visited must be a match city
- Each destination in the timeline must contain one or more matches
- Every match must be reachable by a flight that arrives **before** kickoff
- Flights must follow chronological order

✈️ Match Rules:
- 1 match (any city): TLV → match → TLV (2 flights + 1 destination)
- 2 matches in same city: TLV → city → TLV (2 flights + 1 destination)
- 2 matches in different cities: TLV → city1 → city2 → TLV (3 flights + 2 destinations)

❌ Invalid Examples:
- Flights from/to Rome if there's no match there
- Destinations that do not contain any matches
- Segments shown as separate timeline items

✅ Valid Examples:
- TLV → MUC → LEJ → TLV (3 full flights + 2 destinations)
- TLV → BCN → TLV (2 full flights + 1 destination with 2 matches)

Return only fully valid and complete packages that follow all structure and rules.`
        ),
};
