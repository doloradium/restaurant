-- CreateTable
CREATE TABLE "Image" (
  "id" SERIAL NOT NULL,
  "itemId" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,

  CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert sample images
INSERT INTO "Image" ("itemId", "imageUrl") 
SELECT i.id, 
  CASE 
    WHEN i.name = 'Salmon Nigiri' THEN 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=500&auto=format&fit=crop'
    WHEN i.name = 'Dragon Roll' THEN 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=500&auto=format&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop'
  END as "imageUrl"
FROM "Item" i; 