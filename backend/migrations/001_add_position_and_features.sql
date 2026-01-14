-- TapVisit Database Migration
-- Run this SQL in your Supabase SQL editor or PostgreSQL client

-- ============================================
-- 1. Add position column to links table
-- ============================================
ALTER TABLE links ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing links to have sequential positions
WITH ranked_links AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) - 1 as new_position
    FROM links
)
UPDATE links 
SET position = ranked_links.new_position
FROM ranked_links
WHERE links.id = ranked_links.id;

-- ============================================
-- 2. Add bio column to profiles table
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- ============================================
-- 3. Create index for faster link queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_links_user_position ON links(user_id, position);
CREATE INDEX IF NOT EXISTS idx_links_user_active ON links(user_id, is_active);

-- ============================================
-- 4. Profile views tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_ip VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created ON profile_views(created_at);

-- ============================================
-- 5. Detailed click tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_time ON link_clicks(clicked_at);

-- ============================================
-- 6. Social links table
-- ============================================
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_links_user ON social_links(user_id);

-- ============================================
-- SUPABASE STORAGE SETUP (Manual step required)
-- ============================================
-- In Supabase Dashboard > Storage:
-- 1. Create a new bucket called "avatars"
-- 2. Set it as PUBLIC (for profile images to display)
-- 3. Add the following policy for authenticated uploads:
--    
--    Policy name: "Allow authenticated uploads"
--    Target roles: authenticated
--    Operations: INSERT, UPDATE, DELETE
--    Policy: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Or use SQL to create the bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Done! Your database is ready for the new TapVisit features.
