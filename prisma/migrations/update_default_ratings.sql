-- Update default rating from 5 to 0 for any existing records
UPDATE "Review" SET "rating" = 0 WHERE "rating" = 5; 