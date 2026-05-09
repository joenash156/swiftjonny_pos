-- ===============================================================================
-- DATABASE MIGRATION: Support Decimal Quantities (0.5 Increments)
-- ===============================================================================
-- 
-- This migration allows product quantities and stock to be in decimal increments
-- of 0.5 (e.g., 0.5, 1, 1.5, 2, 2.5, 3, etc.)
--
-- Changes Made:
-- 1. products.stock: INT -> DECIMAL(10, 2)
-- 2. sale_items.quantity: INT -> DECIMAL(10, 2)
--
-- DECIMAL(10, 2) provides:
-- - Support for values with up to 2 decimal places
-- - Maximum value: 99,999,999.99
-- - Perfect for tracking half quantities and full quantities
-- 
-- ===============================================================================

-- Backup existing data (optional but recommended)
-- CREATE TABLE products_backup AS SELECT * FROM products;
-- CREATE TABLE sale_items_backup AS SELECT * FROM sale_items;

-- ===============================================================================
-- 1. Modify products table - Change stock column to DECIMAL
-- ===============================================================================

ALTER TABLE products 
MODIFY COLUMN stock DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Verify the change
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'stock';

-- ===============================================================================
-- 2. Modify sale_items table - Change quantity column to DECIMAL
-- ===============================================================================

ALTER TABLE sale_items 
MODIFY COLUMN quantity DECIMAL(10, 2) NOT NULL;

-- Verify the change
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'sale_items' AND COLUMN_NAME = 'quantity';

-- ===============================================================================
-- Verification Queries (Run these to verify the changes)
-- ===============================================================================

-- Check products table structure
-- DESCRIBE products;
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()
-- ORDER BY ORDINAL_POSITION;

-- Check sale_items table structure
-- DESCRIBE sale_items;
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'sale_items' AND TABLE_SCHEMA = DATABASE()
-- ORDER BY ORDINAL_POSITION;

-- Check existing data is preserved
-- SELECT id, name, stock FROM products LIMIT 5;
-- SELECT id, product_id, quantity FROM sale_items LIMIT 5;

-- ===============================================================================
-- Notes:
-- ===============================================================================
-- 
-- - Data existing in the tables will be preserved during the ALTER operation
-- - Existing integer values (e.g., 5) will become 5.00 in DECIMAL format
-- - The backend and frontend have been updated to handle decimal quantities
-- - Validation now allows values like 0.5, 1.5, 2.5, etc.
--
-- To rollback (if needed):
-- ALTER TABLE products MODIFY COLUMN stock INT NOT NULL DEFAULT 0;
-- ALTER TABLE sale_items MODIFY COLUMN quantity INT NOT NULL;
--
-- ===============================================================================
