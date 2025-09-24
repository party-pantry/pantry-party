/* eslint-disable no-await-in-loop */
/* HOW TO IMPLEMENT SEED:
1. npx prisma db push (updates the database schema)
2. npx prisma db seed (runs this seed file)
*/

import { PrismaClient, Category, Unit, Status } from '@prisma/client';
import { hash } from 'bcrypt';
// import config from '../config/settings.development.json' assert { type: 'json' };
import * as config from '../config/settings.development.json';
import settings from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  // Clear tables and reset IDs
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Stock" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Ingredient" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Storage" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "House" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;');

  console.log('Seeding database...');

  // Create and Seed Users
  // await Promise.all(
  //   config.defaultUsers.map(async (user) => {
  //     const password = await hash(user.password, 10);

  //     console.log(`Seeding user: ${user.email} with id: ${user.id}`);

  //     await prisma.user.upsert({
  //       where: { email: user.email },
  //       update: {},
  //       create: {
  //         id: user.id,
  //         email: user.email,
  //         username: user.username,
  //         password,
  //       },
  //     });
  //   }),
  // );

  // // Seed Houses
  // await Promise.all(
  //   config.defaultHouses.map(async (house) => {
  //     const ownerUser = config.defaultUsers.find(user => user.houses.includes(house.id));
  //     if (!ownerUser) {
  //       console.error(`No owner found for house ${house.name} (id: ${house.id})`);
  //       return;
  //     }

  //     console.log(`Seeding house: ${house.name} with id: ${house.id}`);

  //     await prisma.house.upsert({
  //       where: { id: house.id },
  //       update: {},
  //       create: {
  //         name: house.name,
  //         address: house.address,
  //         user: {
  //           connect: { id: ownerUser.id },
  //         },
  //       },
  //     });
  //   }),
  // );

  // // Seed Storages
  // await Promise.all(
  //   config.defaultStorages.map(async (storage) => {
  //     console.log(`Seeding storage: ${storage.name} with id: ${storage.id}`);

  //     await prisma.storage.upsert({
  //       where: { id: storage.id },
  //       update: {},
  //       create: {
  //         houseId: storage.houseId,
  //         name: storage.name,
  //         type: getCategory(storage.type),
  //       },
  //     });
  //   }),
  // );

  // // Seed Ingredients
  // await Promise.all(
  //   config.defaultIngredients.map(async (ingredient) => {
  //     console.log(`Seeding ingredient: ${ingredient.name} with id: ${ingredient.id}`);

  //     await prisma.ingredient.upsert({
  //       where: { id: ingredient.id },
  //       update: {},
  //       create: {
  //         name: ingredient.name,
  //         price: ingredient.price,
  //       },
  //     });
  //   }),
  // );

  // // Seed Stocks
  // await Promise.all(
  //   config.defaultStocks.map(async (stock) => {
  //     console.log(`Seeding stock with id: ${stock.id}`);

  //     await prisma.stock.upsert({
  //       where: {
  //         ingredientId_storageId: {
  //           ingredientId: stock.ingredientId,
  //           storageId: stock.storageId,
  //         },
  //       },
  //       update: {
  //       },
  //       create: {
  //         ingredientId: stock.ingredientId,
  //         storageId: stock.storageId,
  //         quantity: stock.quantity,
  //         unit: getUnit(stock.unit),
  //         category: getCategory(stock.category),
  //         status: getStatus(stock.status),
  //         last_updated: new Date(stock.last_updated),
  //       },
  //     });
  //   }),
  // );

  // 1. Create users
  const password = await hash('changeme', 10);
  config.defaultUsers.forEach(async (u) => {
    console.log(`  Creating user: ${u.email}`);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        password,
      },
    });
    console.log(`  Created user: ${u.email} with username: ${u.username}`);
  });

    // 2. Create houses for this user
    for (const houseName of u.houses) {
      const houseConfig = settings.defaultHouses.find((h) => h.name === houseName);
      if (!houseConfig) continue;

      const house = await prisma.house.upsert({
        where: { name: houseConfig.name },
        update: {},
        create: {
          name: houseConfig.name,
          address: houseConfig.address,
          userId: user.id,
        },
      });

      // 3. Create storages for this house
      for (const storageName of houseConfig.storages) {
        const storageConfig = settings.defaultStorages.find((s) => s.name === storageName);
        if (!storageConfig) continue;

        await prisma.storage.upsert({
          where: { name: storageConfig.name },
          update: {},
          create: {
            name: storageConfig.name,
            type: storageConfig.type as any,
            houseId: house.id,
          },
        });
      }
    }
  }

  // 4. Ingredients
  for (const ing of settings.defaultIngredients) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: { name: ing.name, price: ing.price },
    });
  }

  // 5. Stocks (link by ingredient + storage names)
  for (const s of settings.defaultStocks) {
    const ingredient = await prisma.ingredient.findUnique({ where: { name: s.ingredient } });
    const storage = await prisma.storage.findUnique({ where: { name: s.storage } });

    if (!ingredient || !storage) continue;

    await prisma.stock.upsert({
      where: {
        ingredientId_storageId: {
          ingredientId: ingredient.id,
          storageId: storage.id,
        },
      },
      update: {},
      create: {
        ingredientId: ingredient.id,
        storageId: storage.id,
        quantity: s.quantity,
        unit: s.unit as any,
        status: s.status as any,
        category: s.category as any,
        last_updated: new Date(s.last_updated),
      },
    });
  }

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
