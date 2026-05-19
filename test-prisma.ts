import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const manholes = await prisma.manhole.findMany({
      include: {
        posts: {
          take: 1,
          select: {
            createdAt: true,
            content: true,
          }
        }
      }
    });
    console.log("Success");
  } catch(e) {
    console.error("Error:", e.message);
  }
}
main();
