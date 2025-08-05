-- Migration: Add page_number column to content_items
-- Based on: devHelp/DBData/pageNumber.md
-- Purpose: Support page number mapping for Confluence page numbering

-- Add the page_number column
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS page_number DECIMAL(3,1) NULL;

-- Add comment for documentation
COMMENT ON COLUMN content_items.page_number IS 'Confluence page number (e.g. 2, 4, 7.1, 11.2) from pageNumber.md mapping';

-- Create index for efficient page number queries
CREATE INDEX IF NOT EXISTS idx_content_items_page_number ON content_items(page_number);
CREATE INDEX IF NOT EXISTS idx_content_items_screen_location_page_number ON content_items(screen_location, page_number);

-- Populate page_number based on screen_location mapping from pageNumber.md
-- Core steps for all four services: 2, 4, 7, 11

-- Page 2: Calculator steps
UPDATE content_items 
SET page_number = 2.0 
WHERE screen_location IN ('mortgage_step1', 'refinance_credit_1', 'credit_step1') 
  AND page_number IS NULL;

-- Page 4: Personal data forms  
UPDATE content_items 
SET page_number = 4.0 
WHERE screen_location IN ('mortgage_step2', 'refinance_credit_2', 'credit_step2') 
  AND page_number IS NULL;

-- Page 7: Income forms
UPDATE content_items 
SET page_number = 7.0 
WHERE screen_location IN ('mortgage_step3', 'refinance_credit_3', 'credit_step3') 
  AND page_number IS NULL;

-- Page 11: Program selection  
UPDATE content_items 
SET page_number = 11.0 
WHERE screen_location IN ('mortgage_step4', 'refinance_credit_4', 'credit_step4') 
  AND page_number IS NULL;

-- Shared pages (all services use same page numbers)
-- Page 1: Home page
UPDATE content_items 
SET page_number = 1.0 
WHERE screen_location = 'home_page' 
  AND page_number IS NULL;

-- Page 3: Phone verification  
UPDATE content_items 
SET page_number = 3.0 
WHERE screen_location = 'phone_verification' 
  AND page_number IS NULL;

-- Page 3.1: SMS code verification
UPDATE content_items 
SET page_number = 3.1 
WHERE screen_location = 'phone_code_verification' 
  AND page_number IS NULL;

-- Sidebar and navigation (page 1.1, 1.2)
UPDATE content_items 
SET page_number = 1.1 
WHERE screen_location = 'sidebar' 
  AND page_number IS NULL;

UPDATE content_items 
SET page_number = 1.2 
WHERE screen_location = 'sidebar_submenu' 
  AND page_number IS NULL;

-- Verify the updates
SELECT 
  screen_location,
  page_number,
  COUNT(*) as item_count
FROM content_items 
WHERE page_number IS NOT NULL
GROUP BY screen_location, page_number
ORDER BY page_number, screen_location;

-- Show summary statistics
SELECT 
  COUNT(*) as total_items,
  COUNT(page_number) as items_with_page_number,
  ROUND(COUNT(page_number) * 100.0 / COUNT(*), 2) as percentage_mapped
FROM content_items;

COMMIT; 