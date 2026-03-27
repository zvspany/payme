import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.theme.upsert({
    where: { id: "terminal-dark" },
    update: {
      name: "Terminal Dark",
      description: "Near-black background, warm text, and muted green accent"
    },
    create: {
      id: "terminal-dark",
      name: "Terminal Dark",
      description: "Near-black background, warm text, and muted green accent"
    }
  });

  await prisma.theme.upsert({
    where: { id: "amber-paper" },
    update: {
      name: "Amber Paper",
      description: "Soft dark slate with amber accent and warm mono feel"
    },
    create: {
      id: "amber-paper",
      name: "Amber Paper",
      description: "Soft dark slate with amber accent and warm mono feel"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
