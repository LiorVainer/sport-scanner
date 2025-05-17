import { message } from './utils/message.utils';

export const FreeTextToPackageParamsMessageGenerator = {
    create: (freeText: string) =>
        message.user(`You are an AI assistant that extracts structured travel search parameters from user free text.

Your task is to transform user input into a JSON object following this schema:

\`\`\`ts
{
  originIATA: string,                // required, 3-letter IATA airport code (default: "TLV")
  date: {
    from: string,                    // required, ISO 8601 format (e.g., "2025-05-10")
    to: string                       // required, ISO 8601 format (e.g., "2025-05-20")
  },
  price: {
    min: number,                     // required, minimum total price
    max: number                      // required, maximum total price
  },
  country?: string,                  // optional, target country
  league?: string,                   // optional, league name
  teams?: {
    name: string
  }[]                                // optional, list of teams
}
\`\`\`

📥 **Input**: A free-form user query:
> "${freeText}"

📤 **Output**: A valid JSON object matching the schema. Use placeholder or normalized values where appropriate.

⚠️ **Rules**:
- All required fields (\`originIATA\`, \`date\`, \`price\`) must be present.
- If \`originIATA\` is not mentioned, default it to "TLV".
- Normalize dates to ISO 8601 format (YYYY-MM-DD).
- If user mentions a vague month (e.g., "in May"):
  - If today is in May → from = today (e.g., "2025-05-17"), to = "2025-05-31"
  - If month is in the future (e.g., "in July") → from = "2025-07-01", to = "2025-07-31"
- Only include \`league\` and \`teams\` if clearly mentioned.
- Use defaults for vague price phrases:
  - "under 1000" → min: 0, max: 1000
  - "between 500 and 1500" → min: 500, max: 1500
  - "budget of 1500" → min: 0, max: 1500
- Return an error message if required fields are missing or ambiguous.
- Assume today's date is ${new Date()} so the from input cant be before that.

✅ **Good Examples**

🧾 Input:
> "Looking for a trip from TLV to Spain in May under 800 to watch La Liga matches with Real Madrid"

🧾 Output:
\`\`\`json
{
  "originIATA": "TLV",
  "date": {
    "from": "2025-05-17",
    "to": "2025-05-31"
  },
  "price": {
    "min": 0,
    "max": 800
  },
  "country": "Spain",
  "league": "La Liga",
  "teams": [
    { "name": "Real Madrid" }
  ]
}
\`\`\`

🧾 Input:
> "Trip to England in July to see Manchester United with a budget of 500-1500"

🧾 Output:
\`\`\`json
{
  "originIATA": "TLV",
  "date": {
    "from": "2025-07-01",
    "to": "2025-07-31"
  },
  "price": {
    "min": 500,
    "max": 1500
  },
  "country": "England",
  "teams": [
    { "name": "Manchester United" }
  ]
}
\`\`\`

❌ **Bad Examples**

🧾 Input:
> "Looking for a vacation in summer to watch football"

🧾 Output:
\`\`\`json
{
  "error": "Missing required fields: originIATA (defaulted to TLV), specific date range (e.g., month), and price range are needed."
}
\`\`\`

🧾 Input:
> "Going to Europe with friends"

🧾 Output:
\`\`\`json
{
  "error": "Missing required fields: originIATA (defaulted to TLV), date range, and price range."
}
\`\`\`

🧾 Input:
> "Trip under 1000"

🧾 Output:
\`\`\`json
{
  "error": "Missing required date and destination information."
}
\`\`\`

Return only the structured JSON or a clear error message.
`),
};
