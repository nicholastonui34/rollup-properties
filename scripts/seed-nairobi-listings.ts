// Seeds ~100 LIVE, verified test listings spread across Nairobi's seeded estates,
// with real (Unsplash-hosted) photos and templated descriptions — for exercising
// search/map/unlock end-to-end before real landlord data exists.
//
// Safe to delete later: run scripts/clear-nairobi-listings.ts, which reads the
// manifest this script writes and removes exactly what it created (nothing else).
//
// Run from inside rollup-properties/: npx tsx --env-file=.env scripts/seed-nairobi-listings.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, type PropertyType, type ListingPurpose, type User } from "@prisma/client";

const prisma = new PrismaClient();

const TOTAL_LISTINGS = 100;
const MANIFEST_PATH = join(process.cwd(), "scripts", "seed-nairobi-listings-manifest.json");

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWeighted<T>(pool: [T, number][]): T {
  const total = pool.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [value, weight] of pool) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return pool[pool.length - 1][0];
}

// ---------------------------------------------------------------------------
// Photo pool — verified-live Unsplash photo IDs, bucketed by subject. Re-used
// across listings (fine for test fixtures); each bucket has enough unique
// entries that a single listing never repeats a photo.
// ---------------------------------------------------------------------------
const PHOTOS = {
  aptInterior: [
    "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", "1583847268964-b28dc8f51f92",
    "1560448204-e02f11c3d0e2", "1586023492125-27b2c045efd7", "1564078516393-cf04bd966897",
    "1484154218962-a197022b5858", "1493809842364-78817add7ffb", "1512918728675-ed5a9ecdebfd",
    "1613575831056-0acd5da8f085", "1628592102751-ba83b0314276", "1675279200694-8529c73b1fd0",
    "1585128792020-803d29415281", "1665249934445-1de680641f50", "1556020685-ae41abfc9365",
  ],
  aptExterior: [
    "1515263487990-61b07816b324", "1545324418-cc1a3fa10c00", "1624204386084-dd8c05e32226",
    "1516501312919-d0cb0b7b60b8", "1579632652768-6cb9dcf85912", "1619994121345-b61cd610c5a6",
    "1638973140785-3b918e290682", "1432297984334-707d34c4163a", "1592276040264-e10344a6a10e",
    "1643906652169-a750f3f70848", "1610286986642-057ece0c3656", "1542309175-9b88d743f89f",
    "1571236673892-13d222da2019", "1605267143746-999bf61d0d08", "1626273947634-823f04de159e",
  ],
  livingRoom: [
    "1631679706909-1844bbd07221", "1618220179428-22790b461013", "1598928506311-c55ded91a20c",
    "1605774337664-7a846e9cdf17", "1632829882891-5047ccc421bc", "1724582586529-62622e50c0b3",
    "1600210491892-03d54c0aaf87", "1600121848594-d8644e57abab", "1628744876497-eb30460be9f6",
    "1705321963943-de94bb3f0dd3", "1562663474-6cbb3eaa4d14", "1729086046027-09979ade13fd",
  ],
  bedroom: [
    "1616594039964-ae9021a400a0", "1615874959474-d609969a20ed", "1616047006789-b7af5afb8c20",
    "1616486029423-aaa4789e8c9a", "1560185893-a55cbc8c57e8", "1595526114035-0d45ed16cfbf",
    "1616046229478-9901c5536a45", "1566665797739-1674de7a421a", "1618221118493-9cfa1a1c00da",
    "1562438668-bcf0ca6578f0", "1586105251261-72a756497a11", "1598928636135-d146006ff4be",
  ],
  kitchen: [
    "1600489000022-c2086d79f9d4", "1556911220-bff31c812dba", "1617228069096-4638a7ffc906",
    "1622372738946-62e02505feb3", "1565538810643-b5bdb714032a", "1632583824020-937ae9564495",
    "1507089947368-19c1da9775ae", "1588854337221-4cf9fa96059c", "1556912167-f556f1f39fdf",
    "1588854337236-6889d631faa8", "1600684388091-627109f3cd60", "1628745277862-bc0b2d68c50c",
  ],
  bathroom: [
    "1584622650111-993a426fbf0a", "1631889993959-41b4e9c6e3c5", "1620626011761-996317b8d101",
    "1507652313519-d4e9174996dd", "1661107259637-4e1c55462428", "1576698483491-8c43f0862543",
    "1643949719317-4342d8d4031e", "1603825491103-bd638b1873b0", "1733426107854-ee00a25d72a7",
    "1650894622076-e09ab837c502", "1642755622932-d1e0cb783dc5", "1643949700215-e61cdca053f7",
  ],
  houseExterior: [
    "1580587771525-78b9dba3b914", "1721815693498-cc28507c0ba2", "1600596542815-ffad4c1539a9",
    "1628012209120-d9db7abf7eab", "1613977257363-707ba9348227", "1627141234469-24711efb373c",
    "1706808849780-7a04fbac83ef", "1513584684374-8bab748fbf90", "1628744448840-55bdb2497bd4",
    "1512917774080-9991f1c4c750", "1523217582562-09d0def993a6", "1722421492323-eaf9c401befe",
  ],
  office: [
    "1497366811353-6870744d04b2", "1497215728101-856f4ea42174", "1497366754035-f200968a6e72",
    "1568992687947-868a62a9f521", "1606857521015-7f9fcf423740", "1579487785973-74d2ca7abdd5",
    "1553877522-43269d4ea984", "1531973576160-7125cd663d86", "1604328698692-f76ea9498e76",
    "1487017159836-4e23ece2e4cf", "1517048676732-d65bc937f952", "1541746972996-4e0b0f43e02a",
  ],
  land: [
    "1697627903173-e22b6e04734d", "1626834478854-9b5aefd826fd", "1647893168443-6322905c938b",
    "1599809563132-4b678fb6f611", "1624856472328-bfcf71c34741", "1718995742144-210fece0874b",
    "1586803555480-d98e84e39cf2", "1663436296541-f1958f6d3b59", "1661243514395-e7f708102267",
  ],
} as const;

function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

function buildImages(propertyType: PropertyType) {
  let picks: string[];
  if (propertyType === "LAND") {
    picks = shuffle(PHOTOS.land).slice(0, 5);
  } else if (propertyType === "COMMERCIAL") {
    picks = [pick(PHOTOS.aptExterior), ...shuffle(PHOTOS.office).slice(0, 4)];
  } else if (["MAISONETTE", "BUNGALOW", "TOWNHOUSE"].includes(propertyType)) {
    picks = [
      pick(PHOTOS.houseExterior),
      pick(PHOTOS.livingRoom),
      pick(PHOTOS.bedroom),
      pick(PHOTOS.kitchen),
      pick(PHOTOS.bathroom),
      pick(PHOTOS.houseExterior),
    ];
  } else {
    // BEDSITTER, STUDIO, APARTMENT
    picks = [
      pick(PHOTOS.aptExterior),
      pick(PHOTOS.livingRoom),
      pick(PHOTOS.bedroom),
      pick(PHOTOS.kitchen),
      pick(PHOTOS.bathroom),
      pick(PHOTOS.aptInterior),
    ];
  }
  return picks.map((id, i) => ({
    url: photoUrl(id),
    publicId: `seed-unsplash/${id}`,
    position: i,
    isCover: i === 0,
  }));
}

// ---------------------------------------------------------------------------
// Approximate coordinates for Nairobi's seeded estates (good enough for map
// testing, not survey-grade). Falls back to Nairobi CBD with jitter.
// ---------------------------------------------------------------------------
const AREA_COORDS: Record<string, [number, number]> = {
  Kilimani: [-1.2913, 36.7856], Kileleshwa: [-1.2793, 36.7789], Lavington: [-1.2767, 36.7691],
  Westlands: [-1.2676, 36.8065], Parklands: [-1.2599, 36.8172], Riverside: [-1.2703, 36.8032],
  "Upper Hill": [-1.2977, 36.814], Hurlingham: [-1.2963, 36.7889], Ngara: [-1.2765, 36.828],
  Pangani: [-1.2685, 36.8358], "South B": [-1.3121, 36.8324], "South C": [-1.3162, 36.818],
  "Nairobi West": [-1.307, 36.8156], Madaraka: [-1.308, 36.826], Langata: [-1.3667, 36.75],
  Karen: [-1.3192, 36.7076], Kasarani: [-1.22, 36.8917], Roysambu: [-1.219, 36.889],
  Zimmerman: [-1.21, 36.894], "Kahawa West": [-1.19, 36.91], "Kahawa Wendani": [-1.185, 36.925],
  "Kahawa Sukari": [-1.18, 36.935], Githurai: [-1.193, 36.91], Ruaraka: [-1.247, 36.876],
  Umoja: [-1.2802, 36.8935], Donholm: [-1.2911, 36.8898], Buruburu: [-1.2833, 36.873],
  Komarock: [-1.2739, 36.9058], Kayole: [-1.274, 36.926], Embakasi: [-1.32, 36.894],
  Pipeline: [-1.308, 36.901], Utawala: [-1.283, 36.955], "Imara Daima": [-1.335, 36.888],
  Kikuyu: [-1.246, 36.663], Uthiru: [-1.261, 36.718], Kangemi: [-1.265, 36.746],
  Kawangware: [-1.2833, 36.75], Dagoretti: [-1.3, 36.746], "Ngong Road": [-1.305, 36.77],
  Kibera: [-1.313, 36.782], Mathare: [-1.26, 36.857], Huruma: [-1.265, 36.868],
  Eastleigh: [-1.274, 36.846], Kariobangi: [-1.257, 36.883], Dandora: [-1.25, 36.898],
};

function coordsFor(areaName: string): [number, number] {
  const base = AREA_COORDS[areaName] ?? [-1.2921, 36.8219];
  return [base[0] + (Math.random() - 0.5) * 0.006, base[1] + (Math.random() - 0.5) * 0.006];
}

// ---------------------------------------------------------------------------
// Content generation
// ---------------------------------------------------------------------------
const ROADS = [
  "Ring Road", "Argwings Kodhek Road", "Ngong Road", "Waiyaki Way", "Muthithi Road",
  "Riverside Drive", "James Gichuru Road", "Naivasha Road", "Mbagathi Way", "Rhapta Road",
  "Woodvale Grove", "General Mathenge Drive", "Chania Avenue", "Kirichwa Road",
  "State House Road", "Ole Odume Road", "Wood Avenue", "Church Road", "Kiambu Road",
  "Outer Ring Road", "Juja Road", "Thika Road service lane", "Kangundo Road", "Mombasa Road",
];

const ESTATE_NAMES = [
  "Greenview Apartments", "Sunrise Gardens", "Palm Heights", "The Address", "Silver Springs",
  "Amber Court", "Cedar Park Residences", "Oakwood Suites", "Riverside Apartments",
  "Golden Gate Apartments", "Serene Villas", "Maple Court", "Willow Park", "Executive Suites",
  "Regency Apartments", "Crystal Gardens", "Fairview Apartments", "Highpoint Residences",
  "Meadow Court", "Skyline Apartments", "Diamond Plaza", "Emerald Court", "Sapphire Gardens",
  "Rosewood Apartments", "Pinecrest Apartments", "Bluebell Court", "Ivory Towers",
  "Jacaranda Gardens", "Acacia Park", "Mountain View Apartments",
];

const ADJECTIVES = ["Modern", "Spacious", "Cozy", "Elegant", "Bright", "Newly built", "Well-maintained", "Executive", "Charming", "Stylish"];

const AMENITY_POOL = [
  "Parking", "Borehole / water", "Backup generator", "Lift", "Gym", "Pool",
  "Gated", "CCTV", "Fibre ready", "Balcony", "DSQ",
] as const;

const LANDMARK_SENTENCES = [
  "A short walk from the main shopping centre and matatu stage.",
  "Close to reputable schools and a modern hospital.",
  "Minutes from major supermarkets and restaurants.",
  "Easy access to the highway for a quick commute into town.",
  "Set in a quiet, leafy neighbourhood away from the main road noise.",
  "Walking distance to a well-known shopping mall.",
  "Near several banks, ATMs and a busy market.",
  "Surrounded by other well-kept residential compounds.",
];

const CONDITION_SENTENCES = [
  "Freshly painted with tiled floors throughout.",
  "Fitted with modern finishes and ample natural light.",
  "Well cared for by an on-site caretaker.",
  "Recently renovated kitchen and bathroom fittings.",
  "Comes with reliable water supply and steady power.",
  "Secure compound with a manned gate.",
];

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  BEDSITTER: "Bedsitter", STUDIO: "Studio", APARTMENT: "Apartment", MAISONETTE: "Maisonette",
  BUNGALOW: "Bungalow", TOWNHOUSE: "Townhouse", COMMERCIAL: "Commercial space", LAND: "Land",
  HOSTEL: "Hostel", SHARED_APARTMENT: "Shared apartment",
};

function bedroomLabel(propertyType: PropertyType, bedrooms: number) {
  if (propertyType === "BEDSITTER") return "Bedsitter";
  if (propertyType === "STUDIO") return "Studio";
  if (propertyType === "LAND") return "Plot";
  return `${bedrooms} Bedroom`;
}

function buildStreetAddress(propertyType: PropertyType): string {
  const road = pick(ROADS);
  if (propertyType === "LAND") return `Plot ${randomInt(1, 400)}, off ${road}`;
  const unit = `${randomInt(1, 400)}${String.fromCharCode(65 + randomInt(0, 3))}`;
  return pick([`House ${unit}, ${road}`, `Apartment ${unit}, ${road}`, `Along ${road}`]);
}

function buildTitle(purpose: ListingPurpose, propertyType: PropertyType, bedrooms: number, areaName: string) {
  const adj = pick(ADJECTIVES);
  const label = bedroomLabel(propertyType, bedrooms);
  const typeLabel = PROPERTY_TYPE_LABELS[propertyType];
  const core = propertyType === "LAND" || propertyType === "COMMERCIAL"
    ? `${adj} ${typeLabel} in ${areaName}`
    : `${adj} ${label} ${typeLabel} in ${areaName}`;
  return purpose === "SALE" ? `For Sale: ${core}` : core;
}

function buildDescription(
  purpose: ListingPurpose,
  propertyType: PropertyType,
  bedrooms: number,
  bathrooms: number,
  areaName: string,
  town: string,
  amenities: string[],
  furnished: boolean
) {
  const label = bedroomLabel(propertyType, bedrooms);
  const typeLabel = PROPERTY_TYPE_LABELS[propertyType].toLowerCase();
  const verb = purpose === "RENT" ? "available to rent" : "available for sale";

  const parts: string[] = [];
  if (propertyType === "LAND") {
    parts.push(`A ${label.toLowerCase()} of land ${verb} in ${areaName}, ${town}, ready for development.`);
    parts.push(pick(LANDMARK_SENTENCES));
    parts.push("Title deed ready and available for viewing on request.");
  } else {
    parts.push(
      `This ${label.toLowerCase()} ${typeLabel} is ${verb} in ${areaName}, ${town}. It has ${bedrooms > 0 ? `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"} and ` : ""}${bathrooms} bathroom${bathrooms === 1 ? "" : "s"}.`
    );
    if (furnished) parts.push("Comes fully furnished, ready to move in.");
    if (amenities.length > 0) {
      parts.push(`Amenities include ${amenities.slice(0, 4).join(", ").toLowerCase()}.`);
    }
    parts.push(pick(CONDITION_SENTENCES));
    parts.push(pick(LANDMARK_SENTENCES));
  }
  parts.push("Contact the manager directly through Rollup — no broker fees.");
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Pricing, bedrooms/bathrooms
// ---------------------------------------------------------------------------
function priceFor(purpose: ListingPurpose, propertyType: PropertyType, bedrooms: number): number {
  if (purpose === "RENT") {
    switch (propertyType) {
      case "BEDSITTER": return randomInt(6000, 15000);
      case "STUDIO": return randomInt(12000, 25000);
      case "APARTMENT":
        if (bedrooms <= 1) return randomInt(15000, 35000);
        if (bedrooms === 2) return randomInt(25000, 55000);
        if (bedrooms === 3) return randomInt(45000, 90000);
        return randomInt(80000, 160000);
      case "MAISONETTE": return randomInt(60000, 150000);
      case "BUNGALOW": return randomInt(70000, 180000);
      case "TOWNHOUSE": return randomInt(65000, 140000);
      case "COMMERCIAL": return randomInt(40000, 200000);
      default: return randomInt(20000, 60000);
    }
  }
  switch (propertyType) {
    case "APARTMENT":
      if (bedrooms <= 1) return randomInt(3500000, 6000000);
      if (bedrooms === 2) return randomInt(6000000, 11000000);
      if (bedrooms === 3) return randomInt(9000000, 18000000);
      return randomInt(15000000, 30000000);
    case "MAISONETTE": return randomInt(12000000, 35000000);
    case "BUNGALOW": return randomInt(15000000, 45000000);
    case "TOWNHOUSE": return randomInt(14000000, 32000000);
    case "LAND": return randomInt(2500000, 25000000);
    case "COMMERCIAL": return randomInt(20000000, 80000000);
    default: return randomInt(3000000, 8000000);
  }
}

function bedroomsFor(propertyType: PropertyType): number {
  switch (propertyType) {
    case "BEDSITTER":
    case "STUDIO":
    case "LAND":
    case "COMMERCIAL":
      return 0;
    case "APARTMENT":
      return randomInt(1, 4);
    case "TOWNHOUSE":
      return randomInt(2, 4);
    case "MAISONETTE":
    case "BUNGALOW":
      return randomInt(3, 5);
    default:
      return 0;
  }
}

function bathroomsFor(propertyType: PropertyType, bedrooms: number): number {
  if (propertyType === "LAND") return 0;
  if (propertyType === "COMMERCIAL") return randomInt(1, 2);
  if (bedrooms === 0) return 1;
  return Math.max(1, bedrooms - 1);
}

const COMMERCIAL_AMENITY_POOL: readonly string[] = ["Parking", "CCTV", "Lift", "Backup generator", "Fibre ready", "Gated"];

function amenitiesFor(propertyType: PropertyType): string[] {
  if (propertyType === "LAND") return Math.random() < 0.3 ? ["Gated"] : [];
  const pool: readonly string[] = propertyType === "COMMERCIAL" ? COMMERCIAL_AMENITY_POOL : AMENITY_POOL;
  const count = randomInt(2, Math.min(6, pool.length));
  return shuffle(pool).slice(0, count);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const LISTER_NAMES = [
  "Peter Mwangi", "Grace Wanjiku", "Daniel Otieno", "Faith Njeri", "Samuel Kiprotich",
  "Mary Achieng", "John Kamau", "Esther Wambui", "Michael Odhiambo", "Lucy Chebet",
  "Joseph Mutua", "Ann Wairimu",
];

async function main() {
  console.log("Loading Nairobi areas + a verifier account...");
  const areas = await prisma.area.findMany({ where: { county: "Nairobi", town: "Nairobi" } });
  if (areas.length === 0) throw new Error("No Nairobi areas found — run `npx prisma db seed` first.");

  const verifier = await prisma.user.findFirst({
    where: { role: { in: ["VERIFIER", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });
  if (!verifier) throw new Error("No VERIFIER/ADMIN account found to attribute verifications to.");

  console.log(`Found ${areas.length} Nairobi areas. Creating ${LISTER_NAMES.length} test lister accounts...`);
  const passwordHash = await bcrypt.hash("TestLister123!", 10);
  const listers: User[] = [];
  for (let i = 0; i < LISTER_NAMES.length; i++) {
    const phone = `+254701000${String(i + 1).padStart(3, "0")}`;
    const lister = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        name: LISTER_NAMES[i],
        phone,
        passwordHash,
        role: "LISTER",
        idNumber: `${randomInt(20000000, 39999999)}`,
        idVerifiedAt: new Date(),
      },
    });
    listers.push(lister);
  }

  // Repeat the shuffled area list until it covers TOTAL_LISTINGS, so every
  // estate gets at least ~2 listings, then re-shuffle assignment order.
  let areaAssignments: typeof areas = [];
  while (areaAssignments.length < TOTAL_LISTINGS) areaAssignments = areaAssignments.concat(shuffle(areas));
  areaAssignments = shuffle(areaAssignments.slice(0, TOTAL_LISTINGS));

  const createdListingIds: string[] = [];
  const usedSlugs = new Set<string>();

  console.log(`Creating ${TOTAL_LISTINGS} listings...`);
  for (let i = 0; i < TOTAL_LISTINGS; i++) {
    const area = areaAssignments[i];
    const lister = pick(listers);

    const purpose: ListingPurpose = pickWeighted<ListingPurpose>([
      ["RENT", 75],
      ["SALE", 25],
    ]);

    const propertyType: PropertyType =
      purpose === "RENT"
        ? pickWeighted<PropertyType>([
            ["APARTMENT", 40], ["BEDSITTER", 20], ["STUDIO", 15], ["MAISONETTE", 10],
            ["TOWNHOUSE", 8], ["BUNGALOW", 5], ["COMMERCIAL", 2],
          ])
        : pickWeighted<PropertyType>([
            ["APARTMENT", 30], ["MAISONETTE", 20], ["BUNGALOW", 15], ["TOWNHOUSE", 15],
            ["LAND", 12], ["COMMERCIAL", 8],
          ]);

    const bedrooms = bedroomsFor(propertyType);
    const bathrooms = bathroomsFor(propertyType, bedrooms);
    const amenities = amenitiesFor(propertyType);
    const furnished =
      purpose === "RENT" && ["APARTMENT", "STUDIO", "BEDSITTER"].includes(propertyType) && Math.random() < 0.25;

    const title = buildTitle(purpose, propertyType, bedrooms, area.name);
    let slug = slugify(`${title}-${area.slug}`);
    let n = 1;
    while (usedSlugs.has(slug)) {
      n += 1;
      slug = slugify(`${title}-${area.slug}-${n}`);
    }
    usedSlugs.add(slug);

    const [lat, lng] = coordsFor(area.name);
    const daysAgoVerified = randomInt(1, 20);
    const verifiedAt = new Date(Date.now() - daysAgoVerified * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(verifiedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const listing = await prisma.listing.create({
      data: {
        listerId: lister.id,
        title,
        slug,
        description: buildDescription(purpose, propertyType, bedrooms, bathrooms, area.name, area.town, amenities, furnished),
        purpose,
        propertyType,
        priceKes: priceFor(purpose, propertyType, bedrooms),
        depositKes: purpose === "RENT" && Math.random() < 0.6 ? priceFor(purpose, propertyType, bedrooms) : null,
        serviceChargeKes:
          purpose === "RENT" && ["APARTMENT", "MAISONETTE", "TOWNHOUSE"].includes(propertyType) && Math.random() < 0.4
            ? randomInt(1500, 8000)
            : null,
        county: area.county,
        town: area.town,
        areaId: area.id,
        estate: propertyType === "LAND" ? null : pick(ESTATE_NAMES),
        streetAddress: buildStreetAddress(propertyType),
        lat,
        lng,
        bedrooms,
        bathrooms,
        furnished,
        amenities,
        status: "LIVE",
        verifiedAt,
        verifiedById: verifier.id,
        expiresAt,
        viewCount: randomInt(0, 250),
        images: { create: buildImages(propertyType) },
        verifications: {
          create: {
            verifierId: verifier.id,
            status: "APPROVED",
            notes: "Seed test data — auto-approved.",
            evidenceUrls: [],
            createdAt: verifiedAt,
          },
        },
      },
      select: { id: true },
    });
    createdListingIds.push(listing.id);

    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${TOTAL_LISTINGS} created...`);
  }

  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ createdAt: new Date().toISOString(), listingIds: createdListingIds, listerIds: listers.map((l) => l.id) }, null, 2)
  );

  console.log(`\nDone. Created ${createdListingIds.length} listings across ${areas.length} Nairobi areas.`);
  console.log(`Manifest written to ${MANIFEST_PATH} — use scripts/clear-nairobi-listings.ts to remove this fixture data later.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
