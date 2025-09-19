/* HOW TO IMPLEMENT SEED:
1. npx prisma db push (updates the database schema)
2. npx prisma db seed (runs this seed file)
*/

import { PrismaClient, Category, Unit, Status } from '@prisma/client';
import { hash } from 'bcrypt';
import config from '../config/settings.development.json' assert { type: 'json' };

const prisma = new PrismaClient();

const getCategory = (category: string): Category => {
  switch (category) {
    case 'FRIDGE':
      return Category.FRIDGE;
    case 'PANTRY':
      return Category.PANTRY;
    case 'FREEZER':
      return Category.FREEZER;
    case 'SPICE_RACK':
      return Category.SPICE_RACK;
    case 'OTHER':
      return Category.OTHER;
    default:
      return Category.OTHER;
  }
};

const getUnit = (unit: string): Unit => {
  switch (unit) {
    case 'OUNCE':
      return Unit.OUNCE;
    case 'POUND':
      return Unit.POUND;
    case 'GRAM':
      return Unit.GRAM;
    case 'KILOGRAM':
      return Unit.KILOGRAM;
    case 'MILILITER':
      return Unit.MILILITER;
    case 'LITER':
      return Unit.LITER;
    case 'FLUID_OUNCE':
      return Unit.FLUID_OUNCE;
    case 'CUP':
      return Unit.CUP;
    case 'PINT':
      return Unit.PINT;
    case 'QUART':
      return Unit.QUART;
    case 'GALLON':
      return Unit.GALLON;
    case 'TEASPOON':
      return Unit.TEASPOON;
    case 'TABLESPOON':
      return Unit.TABLESPOON;
    case 'BAG':
      return Unit.BAG;
    case 'CAN':
      return Unit.CAN;
    case 'BOTTLE':
      return Unit.BOTTLE;
    case 'BOX':
      return Unit.BOX;
    case 'PIECE':
      return Unit.PIECE;
    case 'SACK':
      return Unit.SACK;
    default:
      return Unit.PIECE;
  }
}

const getStatus = (status: string): Status => {
  switch (status) {
    case 'GOOD':
      return Status.GOOD;
    case 'LOW_STOCK':
      return Status.LOW_STOCK;
    case 'OUT_OF_STOCK':
      return Status.OUT_OF_STOCK;
    case 'EXPIRED':
      return Status.EXPIRED;
    default:
      return Status.EXPIRED;
  }
}


async function main() {
  console.log('Seeding database...');

  // Seed Users
  await Promise.all(
    config.defaultUsers.map(async (user) => {
      const password = await hash(user.password, 10);

      console.log(`Seeding user: ${user.email} with id: ${user.id}`);

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          username: user.username,
          password,
        }
      });
    }),
  );

  // Seed Houses
  await Promise.all(
    config.defaultHouses.map(async (house) => {

      const ownerUser = config.defaultUsers.find(user => 
        user.houses.includes(house.id)
      );
      if (!ownerUser) {
        console.error(`No owner found for house ${house.name} (id: ${house.id})`);
        return;
      }

      console.log(`Seeding house: ${house.name} with id: ${house.id}`);

      await prisma.house.upsert({
        where: { id: house.id },
        update: {},
        create: {
          name: house.name,
          address: house.address,
          user: { 
            connect: { id: ownerUser.id }
          },
        },
      });
    })
  );

  // Seed Storages
  await Promise.all(
    config.defaultStorages.map(async (storage) => {

      console.log(`Seeding storage: ${storage.name} with id: ${storage.id}`);

      await prisma.storage.upsert({
        where: { id: storage.id },
        update: {},
        create: {
          houseId: storage.houseId,
          name: storage.name,
          type: getCategory(storage.type),
        },
      });
    })
  );

  // Seed Ingredients
  await Promise.all(
    config.defaultIngredients.map(async (ingredient) => {

      console.log(`Seeding ingredient: ${ingredient.name} with id: ${ingredient.id}`);

      await prisma.ingredient.upsert({
        where: { id: ingredient.id },
        update: {},
        create: {
          name: ingredient.name,
          price: ingredient.price
        },
      });
    })
  );

  // Seed Stocks
  await Promise.all(
    config.defaultStocks.map(async (stock) => {

      console.log(`Seeding stock with id: ${stock.id}`);

      await prisma.stock.upsert({
        where: { id: stock.id },
        update: {},
        create: {
          ingredientId: stock.ingredientId,
          storageId: stock.storageId,
          quantity: stock.quantity,
          unit: getUnit(stock.unit),
          category: getCategory(stock.category),
          status: getStatus(stock.status),
          last_updated: new Date(stock.last_updated),
        },
      })
    })
  )
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