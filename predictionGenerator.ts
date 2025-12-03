import { GoogleGenAI, Type } from "@google/genai";
import { Connection, FutureForecast } from './types';
import { OLD_BARRONS, NEW_BARRONS } from './constants';

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// --- STATIC FALLBACK MATRIX ---
// Used if API fails or no key is present
const PREDICTION_MATRIX: Record<string, string[]> = {
  "old-1:new-1": [
    "Vanderbilt's shipping ruthlessness meets Amazon Logistics. Future: Bezos buys the oceans. All international waters are rebranded 'Prime Waters.' Non-Prime vessels are torpedoed to ensure 2-day delivery efficiency.",
    "The Commodore's 'blockade strategy' applied to AWS. Future: Competitor startups find their internet access physically cut. Amazon builds a literal 'Railroad to the Stars' (Blue Origin space elevator), charging a 90% toll on all off-world cargo."
  ],
  "old-1:new-2": [
    "The Titan of Transport meets the Titan of Mars. Future: Musk establishes the 'Interplanetary Union Pacific.' He purposefully bankrupts Earth-to-Mars competitors by slashing ticket prices, then hikes the return trip price to 'Indentured Servitude' levels.",
    "Vanderbilt's fierce competition meets SpaceX. Future: Starlink satellites are weaponized to de-orbit competitor constellations. The night sky is physically rearranged to spell 'X' using orbital mechanics."
  ],
  "old-1:new-3": [
    "Railroad Monopoly meets the Metaverse. Future: Zuckerberg treats the internet like Vanderbilt treated rail lines. He cuts the 'cables' to rival platforms. You can visit any website you want, as long as you take the Meta-Train through the Horizon Worlds lobby first.",
    "Infrastructure Dominance. Future: Meta lays its own proprietary physical internet cables to every home. Bandwidth is throttled if you aren't wearing a Quest Headset. 'Connection is a privilege, not a right.'"
  ],
  "old-1:new-4": [
    "The Tycoon meets The Cloud. Future: Microsoft executes the 'Azure Blockade.' Enterprise competitors are stranded as Windows 15 updates intentionally brick non-Microsoft cloud connections. The global economy runs on rails owned by Satya.",
    "Vanderbilt's toll-bridge mentality meets AI. Future: Copilot becomes the gatekeeper of all human knowledge. You want to write an email? Pay the toll. You want to compile code? Pay the toll."
  ],
  "old-2:new-1": [
    "Vertical Integration on steroids. Future: Amazon stops buying products and starts owning the atoms. From the rubber tree plantations to the final cardboard box, Bezos owns the entire supply chain. 'The Gospel of Prime' replaces taxation.",
    "Carnegie's cost-cutting meets Amazon Robotics. Future: The 'Dark Warehouse' concept expands to 'Dark Cities.' Entire automated supply hubs run with zero light and zero humans to save 2 cents per unit."
  ],
  "old-2:new-2": [
    "The Bessemer Process meets the Gigafactory. Future: Musk vertically integrates the entire planet. He mines the lithium, smelts the steel, builds the rockets, and owns the Martian soil. 'Earth is just a raw material supplier for Mars,' he declares.",
    "Ruthless Efficiency. Future: The 'Gospel of Wealth' becomes the 'Gospel of Mars.' Musk donates 99% of his fortune to terraforming, but cuts Earth's internet to save power."
  ],
  "old-2:new-3": [
    "Vertical Integration of Reality. Future: Meta manufactures the chips, the headsets, the OS, and the content. Zuck builds 'Company Towns' in the Metaverse where housing is free, but your eyes belong to the company.",
    "Cost-cutting the Human Experience. Future: Why travel? Why buy clothes? Carnegie's ghost guides Zuck to replace all physical goods with digital NFTs. The cost of living drops to zero, but you live in a pod."
  ],
  "old-2:new-4": [
    "The Steel King meets Enterprise AI. Future: Microsoft achieves total vertical integration of the corporate stack. They own the energy (nuclear), the compute (Azure), the code (GitHub), and the worker (AI Agents). Humans are just the 'legacy hardware'.",
    "Efficiency above all. Future: Satya replaces middle management globally with a single Carnegie-inspired AI model. Global GDP doubles, but office birthday parties are banned as 'wasteful expenditures'."
  ],
  "old-3:new-1": [
    "Standard Oil meets The Everything Store. Future: 'Standard Commerce.' Amazon uses predatory pricing to sell goods at a 99% loss until every other retailer on Earth is bankrupt. Then, the price of toothpaste goes to $500.",
    "The Pipeline of Goods. Future: Bezos builds a global pneumatic tube system delivering products instantly. It is the only legal delivery method. Rockefeller's ghost smiles as small businesses are suffocated."
  ],
  "old-3:new-2": [
    "Standard Oil meets Standard Energy. Future: Tesla becomes the new Standard Oil. Musk gives away electric cars for free, but charges for the electricity at his Superchargers—which are the only chargers allowed by law.",
    "Refining the Future. Future: The 'Solar Trust.' Musk creates a Dyson Swarm around the sun. If a nation refuses to sign the Tesla Treaty, he simply turns off their sunlight."
  ],
  "old-3:new-3": [
    "Standard Oil meets The Social Graph. Future: 'Standard Identity.' Meta creates a digital passport required for banking, voting, and working. Zuck controls the pipeline of information. If you are banned, you cease to exist.",
    "The Data Refinery. Future: Just as Rockefeller refined kerosene, Zuck refines human behavior. He sells a predictive model of your life to advertisers before you even live it. Free will is just a legacy bug."
  ],
  "old-3:new-4": [
    "Standard Oil meets Standard Intelligence. Future: 'Standard AI.' Microsoft achieves AGI first. They offer it cheaply to crush Google and OpenAI. Once entrenched, they raise the API price to 'your soul'.",
    "The Cloud Trust. Future: Azure consumes all global compute. Governments rent their sovereignty from Microsoft servers. Satya demands 'rebates' from nations in exchange for not deleting their tax records."
  ],
  "old-4:new-1": [
    "The Banker meets The Merchant. Future: The 'Amazon Reserve.' Bezos bails out the US Government in exchange for the annexation of Delaware. Prime Points replace the Dollar as the global reserve currency.",
    "Morganization of Retail. Future: Bezos creates a 'Board of Directors' for the global economy. He sits at the head. Competitors are merged into 'Amazon Subsidiaries' against their will."
  ],
  "old-4:new-2": [
    "Finance meets Futures. Future: The 'Bank of Mars.' Musk creates a planetary economy backed by nothing but his own reputation. He buys the Earth's national debt and forecloses on the concept of gravity.",
    "Morganization of Industry. Future: Musk forces a merger between auto manufacturers, airlines, and energy grids into 'X Corp.' He fires 80% of the planet's workforce to 'optimize yield'."
  ],
  "old-4:new-3": [
    "The Banker meets The Ledger. Future: 'The Meta Reserve.' Zuckerberg launches a global currency that functions only within VR. He devalues the US Dollar by simply deleting it from the trending topics.",
    "Boardroom Control. Future: Zuck appoints himself to the board of every major media company. He 'stabilizes' democracy by algorithmically removing 'panic-inducing' news. It is the ultimate Morganization of truth."
  ],
  "old-4:new-4": [
    "Finance meets The Enterprise. Future: 'Microsoft Sovereign.' Satya manages the global economy via a single Excel spreadsheet with macros enabled. He bails out failing nations in exchange for Office 365 subscriptions.",
    "The Ultimate Merger. Future: Microsoft merges with the IRS. Taxes are now automatically deducted from your Azure credits. Satya stabilizes the market by deprecating 'Recession.exe'."
  ]
};

const GENERIC_PREDICTIONS = [
  "History doesn't repeat itself, but it does rhyme... usually with 'Monopoly'.",
  "A terrifying fusion of Gilded Age ruthlessness and Silicon Valley scale.",
  "The timeline has fractured. We are now in the 'Era of the Corporate Sovereign'.",
  "Profits are up. Democracy is... pending a software update."
];

// --- FALLBACK GENERATOR ---
const generateFallbackForecasts = (connections: Connection[]): FutureForecast[] => {
  return connections.map(conn => {
    const key = `${conn.from}:${conn.to}`;
    const oldBarron = OLD_BARRONS.find(b => b.id === conn.from);
    const newBarron = NEW_BARRONS.find(b => b.id === conn.to);
    
    const possiblePredictions = PREDICTION_MATRIX[key] || GENERIC_PREDICTIONS;
    const prediction = getRandomItem(possiblePredictions);

    return {
      oldId: conn.from,
      newId: conn.to,
      oldName: oldBarron?.name || "Unknown Tycoon",
      newName: newBarron?.name || "Unknown Techie",
      prediction
    };
  });
};

// --- MAIN AI GENERATOR ---
export const generateFutureForecasts = async (connections: Connection[]): Promise<FutureForecast[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API_KEY found, using fallback matrix.");
    return generateFallbackForecasts(connections);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare the context for the model
    const pairings = connections.map(conn => {
      const oldB = OLD_BARRONS.find(b => b.id === conn.from);
      const newB = NEW_BARRONS.find(b => b.id === conn.to);
      return {
        oldId: conn.from,
        newId: conn.to,
        description: `${oldB?.name} (${oldB?.industry}) paired with ${newB?.name} (${newB?.industry})`
      };
    });

    const prompt = `
      You are an Oracle of Industry. You have been presented with matches between Historical Robber Barons and Modern Tech Titans.
      
      For each pair provided below, generate a ruthless, satirical, and creative prediction of the future. 
      Blend the historical fierceness/monopolistic nature of the Old Barron with the specific futuristic technology of the New Barron.
      Themes: Dystopian corporate sovereignty, total efficiency, monopoly, hilarious ruthlessness.

      Pairs:
      ${JSON.stringify(pairings, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              oldId: { type: Type.STRING },
              newId: { type: Type.STRING },
              prediction: { type: Type.STRING }
            },
            required: ["oldId", "newId", "prediction"]
          }
        }
      }
    });

    const json = JSON.parse(response.text);

    // Hydrate names back into the result
    return json.map((item: any) => {
      const oldB = OLD_BARRONS.find(b => b.id === item.oldId);
      const newB = NEW_BARRONS.find(b => b.id === item.newId);
      return {
        oldId: item.oldId,
        newId: item.newId,
        oldName: oldB?.name || "Unknown",
        newName: newB?.name || "Unknown",
        prediction: item.prediction
      };
    });

  } catch (error) {
    console.error("AI Generation failed, switching to fallback:", error);
    return generateFallbackForecasts(connections);
  }
};
