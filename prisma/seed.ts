import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// County -> Town -> Areas. Nairobi seeded deeply (launch market),
// other major towns get top areas; expand as listings arrive.
const LOCATIONS: Record<string, Record<string, string[]>> = {
  Nairobi: {
    Nairobi: [
      "Kilimani",
      "Kileleshwa",
      "Lavington",
      "Westlands",
      "Parklands",
      "Riverside",
      "Upper Hill",
      "Hurlingham",
      "Ngara",
      "Pangani",
      "South B",
      "South C",
      "Nairobi West",
      "Madaraka",
      "Langata",
      "Karen",
      "Kasarani",
      "Roysambu",
      "Zimmerman",
      "Kahawa West",
      "Kahawa Wendani",
      "Kahawa Sukari",
      "Githurai",
      "Ruaraka",
      "Umoja",
      "Donholm",
      "Buruburu",
      "Komarock",
      "Kayole",
      "Embakasi",
      "Pipeline",
      "Utawala",
      "Imara Daima",
      "Kikuyu",
      "Uthiru",
      "Kangemi",
      "Kawangware",
      "Dagoretti",
      "Ngong Road",
      "Kibera",
      "Mathare",
      "Huruma",
      "Eastleigh",
      "Kariobangi",
      "Dandora",
    ],
  },
  Kiambu: {
    Ruaka: ["Ruaka Town", "Ndenderu", "Banana"],
    Ruiru: ["Ruiru Town", "Kimbo", "Membley"],
    Juja: ["Juja Town", "Juja Farm", "Kalimoni"],
    Kikuyu: ["Kikuyu Town", "Zambezi", "Kinoo", "Regen"],
    Thika: ["Thika Town", "Makongeni", "Ngoingwa", "Section 9"],
    Kiambu: ["Kiambu Town", "Ndumberi"],
    Limuru: ["Limuru Town", "Tigoni"],
  },
  Kajiado: {
    Rongai: ["Ongata Rongai", "Nkoroi", "Rimpa", "Kandisi"],
    Kitengela: ["Kitengela Town", "Milimani", "EPZ"],
    Ngong: ["Ngong Town", "Matasia", "Kibiko"],
  },
  Machakos: {
    Syokimau: ["Syokimau", "Mlolongo", "Katani"],
    "Athi River": ["Athi River Town", "Kinanie"],
    Machakos: ["Machakos Town", "Mua Hills"],
  },
  Mombasa: {
    Mombasa: [
      "Nyali",
      "Bamburi",
      "Shanzu",
      "Kizingo",
      "Tudor",
      "Likoni",
      "Changamwe",
      "Mtwapa",
      "Bombolulu",
    ],
  },
  Kisumu: {
    Kisumu: ["Milimani", "Tom Mboya", "Migosi", "Mamboleo", "Nyalenda", "Kondele"],
  },
  Nakuru: {
    Nakuru: ["Milimani", "Section 58", "Naka", "Shabab", "Lanet", "Free Area", "London"],
  },
  "Uasin Gishu": {
    Eldoret: ["Elgon View", "Kapsoya", "Langas", "West Indies", "Pioneer", "Annex"],
  },
};

async function main() {
  let count = 0;
  for (const [county, towns] of Object.entries(LOCATIONS)) {
    for (const [town, areas] of Object.entries(towns)) {
      for (const name of areas) {
        const slug = slugify(`${town}-${name}`);
        await prisma.area.upsert({
          where: { slug },
          update: {},
          create: { county, town, name, slug },
        });
        count++;
      }
    }
  }
  console.log(`Seeded ${count} areas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
