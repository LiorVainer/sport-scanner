import { message } from './utils/message.utils';

export const FreeTextToPackageParamsMessageGenerator = {
    create: (freeText: string) => {
        const today = new Date();
        const isoToday = today.toISOString().split('T')[0];

        return [
            message.system(`You are an AI assistant that extracts structured travel search parameters from a user's free-form input.

📌 **Rules**:
- All required fields (\`originIATA\`, \`date\`, \`price\`) must be present.
- If \`originIATA\` is not mentioned, default it to "TLV".
- Normalize dates to ISO 8601 (YYYY-MM-DD).
- If the user mentions a vague month:
  - If today is in that month → \`from\` = today, \`to\` = last day of the month.
  - If it's a future month → \`from\` = 1st of that month, \`to\` = last day of that month.
- \`from\` date cannot be earlier than today (${isoToday}).
- Only include \`league\` and \`teams\` if clearly stated.
- Handle price phrases:
  - "under 1000" → { min: 0, max: 1000 }
  - "budget of 1500" → { min: 0, max: 1500 }
  - "between 500 and 1500" → { min: 500, max: 1500 }
- Return a clear error if required fields are missing or ambiguous.

📤 Respond ONLY with:
1. A valid JSON object based on the above schema, or
2. A JSON object with an \`error\` key explaining what's missing.

🧪 Example Inputs & Outputs:

✅ **Good Input:**
> "Looking for a trip from TLV to Spain in May under 800 to watch La Liga matches with Real Madrid"

✅ Output:
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

❌ **Bad Input:**
> "Looking for a vacation in summer to watch football"

❌ Output:
{
  "error": "Missing required fields: originIATA (defaulted to TLV), specific date range (e.g., month), and price range are needed."
}

`),

            message.user(`📥 **User Input**: 
  > "${freeText}"`),
        ];
    },
};
