'use server';

// import { Stuff, Condition } from '@prisma/client';
// import { redirect } from 'next/navigation';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/prefer-default-export

import { hash } from 'bcryptjs';
import { Unit, Status, Category, Difficulty, FoodCategory } from '@prisma/client';
import pluralize from 'pluralize';
import { prisma } from './prisma';
import { isNormalizedCloseMatch } from './fuzzyHelpers';

/* Allow user to fuzzy search for entry in Ingredients */
export async function fuzzySearchIngredients(name: string): Promise<string> {
  const term = (name ?? '').trim().toLowerCase();
  const singularTerm = pluralize.singular(term);
  const pluralTerm = pluralize.plural(term);

  if (!term) {
    return '';
  }

  try {
    const exactMatch = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name: { equals: term, mode: ('insensitive' as any) } },
          { name: { equals: singularTerm, mode: ('insensitive' as any) } },
          { name: { equals: pluralTerm, mode: ('insensitive' as any) } },
        ],
      },
    });
    if (exactMatch) return exactMatch.name;
  } catch (err) {
    // ignore lookup failure
  }

  const tokens = term.split(/\s+/).filter(Boolean);

  const whereClause = tokens.length > 1
    ? {
      OR: [
        { name: { contains: term, mode: ('insensitive' as any) } },
        ...tokens.map((t) => ({ name: { contains: t, mode: ('insensitive' as any) } })),
      ],
    }
    : { name: { contains: term, mode: ('insensitive' as any) } };

  let candidates = await prisma.ingredient.findMany({ where: whereClause, take: 500 });

  if (!candidates.length) {
    candidates = await prisma.ingredient.findMany({ take: 1000 });
  }

  try {
    for (const c of candidates) {
      if (isNormalizedCloseMatch(c.name, term)) {
        return c.name;
      }
      // Also accept when singular forms match (case-insensitive)
      if (pluralize.singular(c.name.toLowerCase()) === singularTerm) {
        return c.name;
      }
    }
  } catch (e) {
    // ignore helper errors and continue to fuzzy ranking
  }

  try {
    const ffMod = await import('fast-fuzzy');
    const names = candidates.map((c) => c.name);
    let ranked: Array<{ name: string; score?: number }> = [];

    const DefaultExport = (ffMod as any).default ?? (ffMod as any);
    if (typeof DefaultExport === 'function') {
      try {
        const inst = new (DefaultExport as any)(names);
        if (typeof inst.search === 'function') {
          const raw = inst.search(term, { limit: 20 });
          ranked = raw.map((r: any) => {
            if (typeof r === 'string') return { name: r };
            if (r && typeof r === 'object' && 'item' in r) return { name: r.item, score: r.score };
            if (Array.isArray(r)) return { name: r[0], score: r[1] };
            return { name: String(r) };
          });
        }
      } catch (e) {
        // ignore
      }
    }

    if (!ranked.length && typeof (ffMod as any).FastFuzzy === 'function') {
      try {
        const inst = new (ffMod as any).FastFuzzy(names);
        const raw = inst.search ? inst.search(term, { limit: 20 }) : [];
        ranked = raw.map((r: any) => (typeof r === 'string' ? { name: r } : { name: r.item ?? r[0], score: r.score }));
      } catch (e) {
        // ignore
      }
    }

    if (!ranked.length && typeof (ffMod as any).rank === 'function') {
      try {
        const raw = (ffMod as any).rank(names, term).slice(0, 20);
        ranked = raw.map((r: any) => ({ name: r[0], score: r[1] }));
      } catch (e) {
        // ignore
      }
    }

    if (ranked.length) {
      const top = ranked[0];
      if (top && top.name && isNormalizedCloseMatch(top.name, term)) {
        return top.name;
      }
    }
  } catch (err) {
    // fast-fuzzy unavailable — fall through to fallback
  }

  const lower = (s: string) => s.toLowerCase();
  const starts = candidates.filter((c) => lower(c.name).startsWith(term));
  if (starts.length) {
    if (pluralize.singular(starts[0].name.toLowerCase()) === singularTerm) return starts[0].name;
  }

  const contains = candidates.filter((c) => lower(c.name).includes(term));
  if (contains.length) {
    if (pluralize.singular(contains[0].name.toLowerCase()) === singularTerm) return contains[0].name;
  }

  const singularReturn = pluralize.singular(name.trim());
  return singularReturn;
}

/* Create a new user with unique email and username */
// eslint-disable-next-line import/prefer-default-export
export async function createUser(credentials: {
  username: string;
  email: string;
  password: string;
}) {
  const password = await hash(credentials.password, 10);
  // Check if user with this email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: credentials.email }, { username: credentials.username }],
    },
  });
  if (existingUser) {
    if (existingUser.email === credentials.email) {
      throw new Error('Email already in use');
    } else {
      throw new Error('Username already in use');
    }
  }
  await prisma.user.create({
    data: {
      email: credentials.email,
      username: credentials.username,
      password,
    },
  });
}

/* Edit stock item */
export async function updateStock(data: {
  storageId: number;
  ingredientId: number;
  newName: string;
  quantity: number;
  unit: Unit;
  status: Status;
}) {
  const sterilizedItemName = pluralize.singular(data.newName.trim().toLowerCase());

  // Get the current stock to check current ingredient
  const currentStock = await prisma.stock.findUnique({
    where: {
      ingredientId_storageId: {
        ingredientId: data.ingredientId,
        storageId: data.storageId,
      },
    },
    include: { ingredient: true },
  });

  if (!currentStock) {
    throw new Error(`Stock not found for storage ${data.storageId} and ingredient ${data.ingredientId}`);
  }

  // Check if name is changing
  if (currentStock.ingredient.name !== sterilizedItemName) {
    // Try to find existing ingredient with the new name
    let targetIngredient = await prisma.ingredient.findFirst({
      where: { name: sterilizedItemName },
    });

    // If ingredient doesn't exist, create it
    if (!targetIngredient) {
      try {
        targetIngredient = await prisma.ingredient.create({
          data: { name: sterilizedItemName, foodCategory: 'OTHER' },
        });
      } catch (error: any) {
        // Handle race condition - ingredient might have been created by another request
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          targetIngredient = await prisma.ingredient.findFirst({
            where: { name: sterilizedItemName },
          });
          if (!targetIngredient) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    // Delete the old stock entry
    await prisma.stock.delete({
      where: {
        ingredientId_storageId: {
          ingredientId: data.ingredientId,
          storageId: data.storageId,
        },
      },
    });

    // Create new stock entry with new ingredient
    const newStock = await prisma.stock.create({
      data: {
        ingredientId: targetIngredient.id,
        storageId: data.storageId,
        quantity: Number(data.quantity),
        unit: data.unit as Unit,
        status: data.status,
      },
    });

    return newStock;
  }
  // Name hasn't changed, just update other fields
  const updatedStock = await prisma.stock.update({
    where: {
      ingredientId_storageId: {
        ingredientId: data.ingredientId,
        storageId: data.storageId,
      },
    },
    data: {
      quantity: Number(data.quantity),
      unit: data.unit as Unit,
      status: data.status,
    },
  });

  return updatedStock;
}

/* Delete stock item */
export async function deleteStock(ingredientId: number, storageId: number) {
  await prisma.stock.delete({
    where: {
      ingredientId_storageId: {
        ingredientId,
        storageId,
      },
    },
  });
}

/* Create a new house */
export async function addHouse(data: { name: string; address?: string; userId: number; latitude?: number; longitude?: number }) {
  await prisma.house.create({
    data: {
      name: data.name,
      address: data.address,
      userId: Number(data.userId),
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
    },
  });
}

/* Edit house by id */
export async function updateHouse(houseId: number, data: { name: string, address?: string, latitude?: number, longitude?: number }) {
  const updatedHouse = await prisma.house.update({
    where: { id: houseId },
    data: {
      name: data.name,
      address: data.address,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
    },
  });

  return updatedHouse;
}

/* Delete house by id */
export async function deleteHouse(houseId: number) {
  await prisma.house.delete({
    where: { id: houseId },
  });
}

/* Get storage name by id */
export async function getStorageName(storageId: number) {
  const storage = await prisma.storage.findUnique({
    where: { id: storageId },
    select: { name: true },
  });
  return storage ? storage.name : null;
}

/* Edit storage by id */
export async function updateStorage(houseId: number, storageId: number, data: { name: string; category: string }) {
  const updatedStorage = await prisma.storage.update({
    where: { id: storageId },
    data: {
      name: data.name,
      type: data.category as Category,
    },
  });

  return updatedStorage;
}

/* Add item to shopping list (manual or from suggestion) */
export async function addShoppingListItem(data: {
  userId: number;
  ingredientId?: number;
  name: string;
  quantity: string;
  category: string;
  priority: string;
  price: number;
  source: string;
  sourceStockIngredientId?: number;
  sourceStorageId?: number;
}) {
  const item = await prisma.shoppingListItem.create({
    data: {
      userId: data.userId,
      ingredientId: data.ingredientId,
      name: data.name,
      quantity: data.quantity,
      category: data.category,
      priority: data.priority,
      price: data.price,
      source: data.source,
      sourceStockIngredientId: data.sourceStockIngredientId,
      sourceStorageId: data.sourceStorageId,
    },
    include: {
      ingredient: true,
    },
  });

  return item;
}

export async function addRecipeInstruction(data: {
  recipeId: number;
  step: number;
  content: string;
}) {
  const instruction = await prisma.recipeInstruction.create({
    data: {
      recipeId: data.recipeId,
      step: data.step,
      content: data.content,
    },
  });

  return instruction;
}

export async function addRecipeIngredient(
  recipeId: number,
  ingredientId: number,
  quantity: number,
  unit: Unit,
  name: string,
): Promise<number | null> {
  try {
    const recipeIngredient = await prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId,
        quantity,
        unit,
        name,
      },
      select: {
        id: true,
      },
    });

    return recipeIngredient.id;
  } catch (error) {
    console.error('Error adding recipe ingredient:', error);
    return null;
  }
}

export async function findIngredientByName(name: string): Promise<number | null> {
  const ingredient = await prisma.ingredient.findFirst({
    where: { name },
    select: { id: true },
  });

  return ingredient ? ingredient.id : null;
}

export async function addIngredient(data: {
  name: string;
  price?: number;
  foodCategory: FoodCategory;
}): Promise<number | null> {
  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        price: data.price || 0, // Default price to 0 if not provided
        foodCategory: data.foodCategory || 'OTHER',
      },
      select: {
        id: true,
      },
    });

    return ingredient.id;
  } catch (error) {
    console.error('Error adding ingredient:', error);
    return null;
  }
}

/* Add a new recipe */
export async function addRecipe(data: {
  userId: number;
  name: string;
  description: string;
  difficulty: Difficulty;
  prepTime?: number;
  cookTime?: number;
  downTime?: number;
  servings?: number;
  rating?: number;
  image?: string;
}) {
  const recipe = await prisma.recipe.create({
    data: {
      userId: data.userId,
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      isStarred: false, // Always false
      prepTime: data.prepTime ?? 0,
      cookTime: data.cookTime ?? 0,
      downTime: data.downTime ?? 0,
      servings: data.servings ?? 1,
      postDate: new Date(),
      rating: data.rating ?? 0,
      image: data.image ?? null,
    },
  });

  return recipe;
}

export async function addInstruction(
  recipeId: number,
  step: number,
  content: string,
) {
  const instruction = await prisma.recipeInstruction.create({
    data: {
      recipeId,
      step,
      content,
    },
  });

  return instruction;
}

/* Get all shopping list items for a user */
export async function getShoppingListItems(userId: number) {
  const items = await prisma.shoppingListItem.findMany({
    where: { userId },
    include: {
      ingredient: true,
    },
    orderBy: {
      addedDate: 'desc',
    },
  });

  return items;
}

export async function addRecipeNutrition(
  recipeId: number,
  name: string,
  amount: number,
  unit: string,
) {
  const nutrition = await prisma.recipeNutrition.create({
    data: {
      recipeId,
      name,
      amount,
      unit,
    },
  });

  return nutrition;
}

/* Update shopping list item */
export async function updateShoppingListItem(
  itemId: number,
  data: {
    name?: string;
    quantity?: string;
    category?: string;
    priority?: string;
    price?: number;
  },
) {
  const item = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data,
  });

  return item;
}

/* Toggle purchased status for shopping list item */
export async function toggleShoppingListItemPurchased(itemId: number) {
  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error(`Shopping list item with ID ${itemId} does not exist`);
  }

  const updatedItem = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { purchased: !item.purchased },
  });

  return updatedItem;
}

/* Delete shopping list item */
export async function deleteShoppingListItem(itemId: number) {
  await prisma.shoppingListItem.delete({
    where: { id: itemId },
  });
}

/* Mark multiple shopping list items as purchased (bulk) */
export async function markShoppingListItemsBoughtBulk(userId: number, ids: number[]) {
  const result = await prisma.shoppingListItem.updateMany({
    where: {
      id: { in: ids },
      userId,
    },
    data: { purchased: true },
  });

  return result;
}

/* Delete multiple shopping list items (bulk) */
export async function deleteShoppingListItemsBulk(userId: number, ids: number[]) {
  const result = await prisma.shoppingListItem.deleteMany({
    where: {
      id: { in: ids },
      userId,
    },
  });

  return result;
}

/* Get suggested items based on low/out of stock inventory */
export async function getSuggestedItems(userId: number) {
  // Get all items already in shopping list to filter them out
  const existingShoppingListItems = await prisma.shoppingListItem.findMany({
    where: {
      userId,
      purchased: false,
    },
    select: {
      ingredientId: true,
    },
  });

  const existingIngredientIds = existingShoppingListItems
    .map((item) => item.ingredientId)
    .filter((id): id is number => id !== null);

  // Get ALL user's stocks to check if they have the ingredient anywhere
  const allUserStocks = await prisma.stock.findMany({
    where: {
      storage: {
        house: {
          userId,
        },
      },
      ingredientId: {
        notIn: existingIngredientIds,
      },
    },
    include: {
      ingredient: true,
      storage: {
        include: {
          house: true,
        },
      },
    },
  });

  // Group stocks by ingredient
  const stocksByIngredient = allUserStocks.reduce((acc, stock) => {
    if (!acc[stock.ingredientId]) {
      acc[stock.ingredientId] = [];
    }
    acc[stock.ingredientId].push(stock);
    return acc;
  }, {} as Record<number, typeof allUserStocks>);

  // Only suggest if ALL instances of ingredient are low/out
  const suggestions = Object.entries(stocksByIngredient)
    .filter(([, stocks]) => stocks.every(
      (stock) => stock.quantity === 0
        || stock.status === Status.OUT_OF_STOCK
        || stock.status === Status.LOW_STOCK
        || stock.status === Status.EXPIRED,
    ))
    .map(([, stocks]) => {
      const firstStock = stocks[0];
      const isOutOfStock = stocks.every(
        (s) => s.quantity === 0 || s.status === Status.OUT_OF_STOCK,
      );

      return {
        ingredientId: firstStock.ingredientId,
        name: firstStock.ingredient.name,
        unit: firstStock.unit,
        status: firstStock.status,
        storageId: firstStock.storageId,
        storageName: firstStock.storage.name || firstStock.storage.type,
        storageType: firstStock.storage.type,
        houseName: firstStock.storage.house.name,
        suggestedPriority: isOutOfStock ? 'High' : 'Medium',
        currentQuantity: firstStock.quantity,
        price: firstStock.ingredient.price ?? 0,
        category: firstStock.ingredient.foodCategory ?? 'Other',
      };
    });

  return suggestions;
}

export async function deleteStorage(houseId: number, storageId: number) {
  // Ensure the storage belongs to the house
  const storage = await prisma.storage.findFirst({
    where: { id: storageId, houseId },
    select: { id: true },
  });
  if (!storage) throw new Error('NOT_FOUND');

  // Remove items (Stock) first, then the Storage
  await prisma.$transaction([
    prisma.stock.deleteMany({ where: { storageId } }),
    prisma.storage.delete({ where: { id: storageId } }),
  ]);

  return { ok: true };
}
