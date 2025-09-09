-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('OUNCE', 'POUND', 'GRAM', 'KILOGRAM', 'MILILITER', 'LITER', 'FLUID_OUNCE', 'CUP', 'PINT', 'QUART', 'GALLON', 'TEASPOON', 'TABLESPOON', 'BAG', 'CAN', 'BOTTLE', 'BOX', 'PIECE', 'SACK');

-- CreateTable
CREATE TABLE "public"."House" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Storage" (
    "id" SERIAL NOT NULL,
    "houseId" INTEGER NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER,
    "storageId" INTEGER NOT NULL,
    "custom_name" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "public"."Unit" NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ingredientId_storageId_key" ON "public"."Stock"("ingredientId", "storageId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_custom_name_storageId_key" ON "public"."Stock"("custom_name", "storageId");

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Storage" ADD CONSTRAINT "Storage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "public"."Storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
