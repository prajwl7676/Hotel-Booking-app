import "dotenv/config";
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";
import { searchParserChain } from "../chains/searchParserChain";

// 20 golden (query -> SearchParams) pairs covering common booking intents
const EXAMPLES = [
  {
    input:  "Beach hotel in Barcelona for 2 adults",
    output: { destination: "Barcelona", adultCount: 2, types: ["Beach Resort"] },
  },
  {
    input:  "Luxury 5-star hotel in Paris under 300 pounds per night",
    output: { destination: "Paris", stars: ["5"], maxPrice: 300, types: ["Luxury"] },
  },
  {
    input:  "Family hotel in London with pool for 2 adults and 2 children",
    output: { destination: "London", adultCount: 2, childCount: 2, facilities: ["Outdoor Pool"] },
  },
  {
    input:  "Cheap hostel in Amsterdam",
    output: { destination: "Amsterdam", types: ["Hostel", "Budget"] },
  },
  {
    input:  "Pet friendly hotel in Edinburgh",
    output: { destination: "Edinburgh", types: ["Pet Friendly"] },
  },
  {
    input:  "Spa resort in Maldives sorted by star rating",
    output: { destination: "Maldives", facilities: ["Spa"], sortOption: "starRating" },
  },
  {
    input:  "All inclusive resort in Cancun for 2 adults",
    output: { destination: "Cancun", adultCount: 2, types: ["All Inclusive"] },
  },
  {
    input:  "Business hotel in New York with free wifi and parking",
    output: { destination: "New York", types: ["Business"], facilities: ["Free WiFi", "Parking"] },
  },
  {
    input:  "Romantic boutique hotel in Rome for 2 adults",
    output: { destination: "Rome", adultCount: 2, types: ["Romantic", "Boutique"] },
  },
  {
    input:  "Budget hotel in Berlin cheapest first",
    output: { destination: "Berlin", types: ["Budget"], sortOption: "pricePerNightAsc" },
  },
  {
    input:  "Cabin in the mountains of Switzerland",
    output: { destination: "Switzerland", types: ["Cabin"] },
  },
  {
    input:  "4 star hotel in Tokyo for 3 adults",
    output: { destination: "Tokyo", adultCount: 3, stars: ["4"] },
  },
  {
    input:  "Self catering apartment in Dublin for 1 adult",
    output: { destination: "Dublin", adultCount: 1, types: ["Self Catering"] },
  },
  {
    input:  "Hotel in Sydney most expensive first",
    output: { destination: "Sydney", sortOption: "pricePerNightDesc" },
  },
  {
    input:  "Golf resort in Scotland",
    output: { destination: "Scotland", types: ["Golf Resort"] },
  },
  {
    input:  "Non-smoking hotel in Singapore under 200 pounds",
    output: { destination: "Singapore", maxPrice: 200, facilities: ["Non-Smoking Rooms"] },
  },
  {
    input:  "Extended stay hotel in Dubai for 2 adults",
    output: { destination: "Dubai", adultCount: 2, types: ["Extended Stays"] },
  },
  {
    input:  "Hostel in Prague with free wifi",
    output: { destination: "Prague", types: ["Hostel"], facilities: ["Free WiFi"] },
  },
  {
    input:  "Family resort in Orlando with pool and fitness center for 2 adults 1 child",
    output: {
      destination: "Orlando",
      adultCount: 2,
      childCount: 1,
      types: ["Family"],
      facilities: ["Outdoor Pool", "Fitness Center"],
    },
  },
  {
    input:  "Beachfront hotel in Bali sorted by lowest price",
    output: { destination: "Bali", types: ["Beach Resort"], sortOption: "pricePerNightAsc" },
  },
];

// Scores how many expected fields the model got right
function exactMatchEvaluator({ run, example }: { run: any; example: any }) {
  const predicted = run.outputs ?? {};
  const expected  = example.outputs ?? {};
  const keys      = Object.keys(expected);

  if (keys.length === 0) return { key: "field_accuracy", score: 1 };

  const correct = keys.filter((k) => {
    const p = predicted[k];
    const e = expected[k];
    return JSON.stringify(p) === JSON.stringify(e);
  });

  return { key: "field_accuracy", score: correct.length / keys.length };
}

async function main() {
  const client  = new Client();
  const today   = new Date().toISOString().slice(0, 10);
  const datasetName = "search-parser-golden-v1";

  // Create dataset once; skip if it already exists
  let dataset;
  try {
    dataset = await client.readDataset({ datasetName });
    console.log(`Using existing dataset: ${dataset.id}`);
  } catch {
    dataset = await client.createDataset(datasetName, {
      description: "20 golden NL query -> SearchParams pairs",
    });
    await client.createExamples({
      inputs:    EXAMPLES.map((e) => ({ query: e.input })),
      outputs:   EXAMPLES.map((e) => e.output),
      datasetId: dataset.id,
    });
    console.log(`Created dataset with ${EXAMPLES.length} examples`);
  }

  const results = await evaluate(
    (input: { query: string }) =>
      searchParserChain.invoke({ query: input.query, today }),
    {
      data:             datasetName,
      evaluators:       [exactMatchEvaluator],
      experimentPrefix: "search-parser",
    }
  );

  // Compute aggregate score and fail CI if below threshold
  const scores: number[] = [];
  for await (const result of results) {
    const score = (result as any).evaluation_results?.results?.[0]?.score;
    if (typeof score === "number") scores.push(score);
  }

  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`\nAverage field_accuracy: ${(avg * 100).toFixed(1)}%`);
    if (avg < 0.85) {
      console.error("FAIL: field_accuracy below 0.85 threshold");
      process.exit(1);
    }
    console.log("PASS");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
