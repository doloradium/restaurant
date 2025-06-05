-- Create new Addresses table
CREATE TABLE IF NOT EXISTS "Address" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "city" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "houseNumber" TEXT NOT NULL,
  "apartment" TEXT,
  "entrance" TEXT,
  "floor" TEXT,
  "intercom" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Modify User table - Remove columns
ALTER TABLE "User"
DROP COLUMN IF EXISTS "street",
DROP COLUMN IF EXISTS "house",
DROP COLUMN IF EXISTS "apartment";

-- Modify Order table
-- First add the new columns
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "addressId" INTEGER,
ADD COLUMN IF NOT EXISTS "deliveryTime" TIMESTAMP(3);

-- Add foreign key constraint for addressId
ALTER TABLE "Order"
ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Copy data from dateOrdered to deliveryTime for existing orders
UPDATE "Order" 
SET "deliveryTime" = "dateOrdered"
WHERE "deliveryTime" IS NULL;

-- Make deliveryTime NOT NULL after data migration
ALTER TABLE "Order" 
ALTER COLUMN "deliveryTime" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "Order"
DROP COLUMN IF EXISTS "dateOrdered",
DROP COLUMN IF EXISTS "dateArrived"; 