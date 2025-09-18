import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import config from '../config/settings.development.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed users
  await Promise.all(
    config.defaultUsers.map(async (user) => {
      const password = await hash(user.password, 10);

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password,
          name: user.name, // Added name field from config
        }
      });
    }),
  );

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });