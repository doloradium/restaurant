# Database Schema Changes - COMPLETED

## Changes Made

1. **Created a new `Address` model with the following fields:**

    - `id`: Primary key
    - `userId`: Foreign key to User table
    - `city`: City name
    - `street`: Street name
    - `houseNumber`: House number
    - `apartment`: Apartment number (optional)
    - `entrance`: Building entrance (optional)
    - `floor`: Floor number (optional)
    - `intercom`: Intercom code (optional)

2. **Modified the `User` model:**

    - Removed `street`, `house`, and `apartment` fields
    - Added relation to `Address` model

3. **Modified the `Order` model:**
    - Removed `dateOrdered` and `dateArrived` fields
    - Added `deliveryTime` field
    - Added `addressId` field for relation to the Address table

## Implementation Steps

1. ✅ Updated the Prisma schema with the new structure.

2. ✅ Created and executed custom Node.js scripts to:

    - Create the new Address table
    - Remove address fields from the User table
    - Add new fields to the Order table
    - Migrate existing date data to the new deliveryTime field
    - Remove old date columns

3. ✅ Generated the Prisma client based on the updated schema.

## Next Steps

1. **Update Application Code:**

    - Update all references to the old User address fields to use the Address model
    - Update order creation to include delivery time and address ID
    - Implement UI for managing multiple addresses per user

2. **Data Migration:**

    - Create Address entries for existing users (if needed)
    - Associate Orders with appropriate addresses

## Testing

1. Test user registration/profile update with new address structure
2. Test creating orders with address selection
3. Verify that users can have multiple addresses
4. Check that orders properly link to addresses

## Technical Notes

-   The migration was completed using direct database manipulation via Node.js scripts
-   The Prisma schema was updated to match the new database structure
-   The migration preserved existing data by copying dateOrdered values to deliveryTime before removing the old columns
