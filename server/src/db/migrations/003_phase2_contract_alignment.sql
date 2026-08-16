DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE user_profiles RENAME COLUMN name TO full_name;
  END IF;
END $$;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE user_profiles SET full_name = '' WHERE full_name IS NULL;
ALTER TABLE user_profiles ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

UPDATE user_profiles p
SET language = COALESCE(pref.language_code, 'en')
FROM user_preferences pref
WHERE pref.user_id = p.user_id;

ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS custom_name TEXT;
ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS planted_at DATE;
ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS area NUMERIC(12, 2);
ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS area_unit TEXT;
ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS user_crops_user_crop_idx ON user_crops(user_id, crop_id);
