-- Make Stock.displayName nullable
-- This migration drops the NOT NULL constraint added earlier so that
-- existing rows without a displayName do not cause errors.

BEGIN;
ALTER TABLE "Stock" ALTER COLUMN "displayName" DROP NOT NULL;
COMMIT;
