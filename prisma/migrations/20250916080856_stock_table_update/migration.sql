/*
  Warnings:

  - Added the required column `category` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('GOOD', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('FRIDGE', 'PANTRY', 'FREEZER', 'SPICE_RACK', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "category" "public"."Category" NOT NULL,
ADD COLUMN     "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'GOOD';
