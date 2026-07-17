import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const area = await prisma.area.findFirst({ where: { slug: "nairobi-kilimani" } });
if (!area) throw new Error("area not found");

const lister = await prisma.user.create({
  data: {
    name: "Test Lister (M3 verify)",
    phone: `2547${Date.now().toString().slice(-8)}`,
    passwordHash: "not-a-real-hash",
    role: "LISTER",
  },
});

const listing = await prisma.listing.create({
  data: {
    listerId: lister.id,
    title: "Bright 2BR apartment near Yaya Centre",
    slug: `test-verify-listing-${Date.now()}`,
    description: "Test listing created to verify M3 search/map rendering. Safe to delete.",
    purpose: "RENT",
    propertyType: "APARTMENT",
    priceKes: 65000,
    county: "Nairobi",
    town: "Nairobi",
    areaId: area.id,
    estate: "Kilimani",
    streetAddress: "Argwings Kodhek Rd",
    lat: -1.2921,
    lng: 36.7872,
    bedrooms: 2,
    bathrooms: 2,
    furnished: true,
    amenities: ["Parking", "Backup generator", "Gated"],
    status: "LIVE",
    verifiedAt: new Date(),
    images: {
      create: [
        { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", publicId: "sample", position: 0, isCover: true },
      ],
    },
  },
});

console.log("Created test listing:", listing.slug);
await prisma.$disconnect();
