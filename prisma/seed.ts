/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* HOW TO IMPLEMENT SEED:
1. npx prisma db push (updates the database schema)
2. npx prisma db seed (runs this seed file)
*/

import { PrismaClient, Category, Unit, Status, Difficulty, FoodCategory } from '@prisma/client';
import { hash } from 'bcrypt';
// import slugify from 'slugify';
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

const getFood = (foodCategory: string): FoodCategory => {
  switch (foodCategory) {
    case 'FROZEN':
      return FoodCategory.FROZEN;
    case 'MEAT':
      return FoodCategory.MEAT;
    case 'PRODUCE':
      return FoodCategory.PRODUCE;
    case 'DAIRY':
      return FoodCategory.DAIRY;
    case 'OTHER':
      return FoodCategory.OTHER;
    default:
      return FoodCategory.OTHER;
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
    case 'LOAVES':
      return Unit.LOAVES;
    case 'BUNDLES':
      return Unit.BUNDLES;
    case 'PACKAGE':
      return Unit.PACKAGE;
    default:
      return Unit.PIECE;
  }
};

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
};

const getDifficulty = (difficulty: string): Difficulty => {
  switch (difficulty) {
    case 'EASY':
      return Difficulty.EASY;
    case 'MEDIUM':
      return Difficulty.MEDIUM;
    case 'HARD':
      return Difficulty.HARD;
    default:
      return Difficulty.EASY;
  }
};

async function main() {
  // Clear tables and reset IDs
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Stock" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Ingredient" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Storage" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "House" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Recipe" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "RecipeIngredient" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "RecipeInstruction" RESTART IDENTITY CASCADE;');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "RecipeNutrition" RESTART IDENTITY CASCADE;');

  console.log('Seeding database...');

  // Seed Users
  for (const user of config.defaultUsers) {
    const password = await hash(user.password, 10);

    console.log(`Seeding User: ${user.username} (Email: ${user.email}, ID: ${user.id})`);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        username: user.username,
        password,
        // bio: user.bio,
        // image`: user.image,
      },
    });
  }

  // Seed Houses
  for (const house of config.defaultHouses) {
    const ownerUser = config.defaultUsers.find(user => user.houses.includes(house.id));

    if (!ownerUser) {
      console.error(`No owner found for house ${house.name}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    console.log(`Seeding House: ${house.name} (ID: ${house.id}, Owner: ${ownerUser.username})`);

    await prisma.house.upsert({
      where: { id: house.id },
      update: {},
      create: {
        name: house.name,
        address: house.address,
        latitude: house.latitude,
        longitude: house.longitude,
        userId: ownerUser.id,
      },
    });
  }

  // Seed Storages
  for (const storage of config.defaultStorages) {
    console.log(`Seeding Storage: ${storage.name} (ID: ${storage.id}, HouseID: ${storage.houseId}, Type: ${storage.type})`);

    await prisma.storage.upsert({
      where: { id: storage.id },
      update: {},
      create: {
        id: storage.id,
        houseId: storage.houseId,
        name: storage.name,
        type: getCategory(storage.type),
      },
    });
  }

  // Seed Ingredients
  for (const ingredient of config.defaultIngredients) {
    console.log(`Seeding Ingredient: ${ingredient.name} (ID: ${ingredient.id}) (cat: ${ingredient.foodCategory})`);

    await prisma.ingredient.upsert({
      where: { id: ingredient.id },
      update: {},
      create: {
        name: ingredient.name,
        price: ingredient.price,
        foodCategory: getFood(ingredient.foodCategory),
      },
    });
  }

  // Seed Stocks
  for (const stock of config.defaultStocks) {
    console.log(`Seeding Stock: IngredientID=${stock.ingredientId}, StorageID=${stock.storageId}, Qty=${stock.quantity} ${stock.unit}, Status=${stock.status}`);

    await prisma.stock.upsert({
      where: {
        ingredientId_storageId: {
          ingredientId: stock.ingredientId,
          storageId: stock.storageId,
        },
      },
      update: {},
      create: {
        ingredientId: stock.ingredientId,
        storageId: stock.storageId,
        quantity: stock.quantity,
        unit: getUnit(stock.unit),
        status: getStatus(stock.status),
      },
    });
  }

  // Seed Recipes
  for (const recipe of config.defaultRecipes) {
    console.log(`Seeding Recipe: ${recipe.name} (ID: ${recipe.id}, UserID: ${recipe.userId})`);

    await prisma.recipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: {
        id: recipe.id,
        userId: recipe.userId,
        name: recipe.name,
        description: recipe.description,
        difficulty: getDifficulty(recipe.difficulty),
        isStarred: recipe.isStarred,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        downTime: recipe.downTime,
        servings: recipe.servings,
        rating: recipe.rating,
        ingredients: {
          create: recipe.ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            name: ing.name,
            quantity: ing.quantity,
            unit: getUnit(ing.unit),
          })),
        },
        instructions: {
          create: recipe.instructions.map((inst: any) => ({
            step: inst.step,
            content: inst.content,
          })),
        },
        nutrition: {
          create: recipe.nutrition.map((nut: any) => ({
            name: nut.name,
            amount: nut.amount,
            unit: nut.unit,
          })),
        },
      },
    });
  }

  // Reset auto-increment sequences to prevent ID conflicts
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"User"\', \'id\'), COALESCE(MAX(id), 1)) FROM "User";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"House"\', \'id\'), COALESCE(MAX(id), 1)) FROM "House";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Storage"\', \'id\'), COALESCE(MAX(id), 1)) FROM "Storage";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Ingredient"\', \'id\'), COALESCE(MAX(id), 1)) FROM "Ingredient";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Recipe"\', \'id\'), COALESCE(MAX(id), 1)) FROM "Recipe";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"RecipeIngredient"\', \'id\'), COALESCE(MAX(id), 1)) FROM "RecipeIngredient";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"RecipeInstruction"\', \'id\'), COALESCE(MAX(id), 1)) FROM "RecipeInstruction";',
  );
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"RecipeNutrition"\', \'id\'), COALESCE(MAX(id), 1)) FROM "RecipeNutrition";',
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
