import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const manholes = await prisma.manhole.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            content: true,
            endereco: true,
          },
        },
      },
    });
    console.log(manholes);
  } catch (e) {
    console.error(e);
  }
}
main();
