import { PrismaClient } from "@prisma/client";

// Tạo một instance PrismaClient global để tránh tạo nhiều connection trong development
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
