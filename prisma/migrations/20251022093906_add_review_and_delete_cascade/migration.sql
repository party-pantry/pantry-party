/*
  Warnings:

  - You are about to drop the column `custom_name` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `foodCategory` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Storage` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('DAIRY', 'PRODUCE', 'MEAT', 'FROZEN', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."House" DROP CONSTRAINT "House_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_storageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Storage" DROP CONSTRAINT "Storage_houseId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "foodCategory" "FoodCategory" NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "custom_name";

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_recipeId_userId_key" ON "Review"("recipeId", "userId");

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
