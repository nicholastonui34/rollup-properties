import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("users:", await prisma.user.count());
console.log("areas:", await prisma.area.count());
console.log("listings:", await prisma.listing.count());
await prisma.$disconnect();
