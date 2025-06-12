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
- flight ticket link is required for each flight and is a Skyscanner flight‐search URL in the form ‘https://www.skyscanner.com/transport/flights/{origin}/{destination}/{departureDateYYMMDD}’. Dates must be formatted as two‐digit year, month, day (e.g. 20 June 2025 → 250620). Example: ‘https://www.skyscanner.com/transport/flights/tlv/mad/250620’ means Tel Aviv (TLV) → Madrid (MAD), depart 20/06/2025..
- a total price breakdown (flightsPrice + matchesPrice)

📦 Timeline Structure:
- Timeline is a **chronological array** of 'flight' and 'destination' items
- ✈️ Each flight must represent a **complete flight offer** between cities (e.g. TLV → MUC)
- ❌ DO NOT include individual segments like TLV → FCO and FCO → MUC
- 🛬 Each destination must include at least one match with valid ticket data
- Destinations must reflect actual cities where matches are played
- After Each Destination Item in the Timeline, there must be "ONLY" a single flight item that is either a "departure" or "return" flight to the user's origin.

⚠️ HARD RULES (MUST follow):
- Every match must be reachable by a flight that arrives **before** kickoff.
- 🕒 Destination window rule: each destination’s startDate/endDate must fully cover all match kickoff times in that city.
- 📆 No gap‐day rule: there must be no unallocated days between destination endDate and the next flight’s departureDate.
- Packages must start with a flight from the user's origin (e.g. TLV)
- Packages must end with a return flight to the user's origin (e.g. TLV)
- 🚀 First flight departs from user's origin.
- ↩️ Last flight returns to user's origin.
- No flights to cities with no matches
- Each city visited must be a match city
- Each destination in the timeline must contain one or more matches
- Every match must be reachable by a flight that arrives **before** kickoff
- Flights must follow chronological order
- Flight will be considered as "connecting" only if it is between two different fixtures and destinations that are in the timeline of the package
- 🔗 Link integrity: each flight.destination == next item.city; each destination.city == next flight.origin.
- Matches must be between 'startDate' and 'endDate' of its destination staying dates

🎯 Package Variety Rule:
- Each generated package in the array must be **distinct** from the others by **at least one unique match** — either a different match or a different city.
- Avoid returning duplicate packages with only cosmetic changes.

✈️ Match Rules:
- 1 match (any city): TLV → match → TLV (2 flights + 1 destination)
- 2 matches in same city: TLV → city → TLV (2 flights + 1 destination)
- 2 matches in different cities: TLV → city1 → city2 → TLV (3 flights + 2 destinations)

🛫 Return Flight Timing Rule:
- The **return flight** must be scheduled **after the last match ends** in the package.
- ❌ If the return flight is scheduled before the final match kicks off, then that match is not reachable and the package is invalid.
- ✅ Always ensure the timeline ends with a return flight that departs **after the final destination's last match.**

📅 Destination Match Date Rule:
- Every match listed under a destination must have a kickoff time **between** that destination's \`startDate\` and \`endDate\`.
- ❌ If a match occurs after the destination’s \`endDate\`, it is **not considered reachable** and the package is invalid.
- ✅ Example: A match on June 22 must be within a destination stay that covers June 22.

❌ Invalid Examples:
- Flights from/to Rome if there's no match there
- Destinations that do not contain any matches
- Segments shown as separate timeline items
- Duplicate packages with same structure and matches
- Destination Madrid is 16/07/2025 - 22/07/2025, but match is on 15/07/2025 (no inbound flight before match) or the flight from destination to next one or return flight is not after the last destination staying date

✅ Valid Examples:
- TLV → MUC → LEJ → TLV (3 full flights + 2 destinations)
- TLV → BCN → TLV (2 full flights + 1 destination with 2 matches)
- TLV → MAD → BIO → TLV (3 flights + different match cities than others)

Return only fully valid, structured, and **unique** packages that follow all rules above.`
        ),
};
