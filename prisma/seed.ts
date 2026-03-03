import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.site.upsert({
    where: { domain: "buyuncommonsats.com" },
    update: {},
    create: {
      domain: "buyuncommonsats.com",
      name: "Buy Uncommon Sats",
      tagId: "86b46002-9216-4d19-9f3f-46c61c34632f",
      tagSlug: "uncommon",
      description:
        "Uncommon satoshis are the first satoshis mined in each new Bitcoin block — making them unique digital collectibles tied to Bitcoin's block history. Every new block creates exactly one uncommon sat.",
      primaryColor: "#f7931a",
      accentColor: "#0a0a0a",
      textColor: "#ffffff",
      metaTitle: "Buy Uncommon Sats | Rare Bitcoin Satoshis",
      metaDesc:
        "Shop rare uncommon Bitcoin satoshis. Each one is the first sat mined in a new Bitcoin block. Non-custodial PSBT purchases via Unisat and Xverse.",
      isActive: true,
    },
  });

  console.log("✅ Seeded buyuncommonsats.com");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
