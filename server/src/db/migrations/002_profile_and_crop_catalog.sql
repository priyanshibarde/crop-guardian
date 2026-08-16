ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_crops ADD COLUMN IF NOT EXISTS crop_id UUID REFERENCES crops(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS user_crops_crop_id_idx ON user_crops(crop_id);

DROP TRIGGER IF EXISTS crops_set_updated_at ON crops;
CREATE TRIGGER crops_set_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION set_updated_at();
