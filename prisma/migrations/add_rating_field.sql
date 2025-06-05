-- Add rating column to Review table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Review' AND column_name = 'rating'
    ) THEN
        ALTER TABLE "Review" ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 0;
    END IF;
END
$$; 