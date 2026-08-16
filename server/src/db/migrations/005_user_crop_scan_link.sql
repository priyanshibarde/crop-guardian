ALTER TABLE scans
  ADD COLUMN IF NOT EXISTS user_crop_id UUID REFERENCES user_crops(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS scans_user_crop_id_created_at_idx
  ON scans(user_crop_id, created_at DESC);
