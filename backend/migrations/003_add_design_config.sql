-- Add design_config column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have default empty config if null (though default handles new ones)
UPDATE profiles SET design_config = '{}'::jsonb WHERE design_config IS NULL;
