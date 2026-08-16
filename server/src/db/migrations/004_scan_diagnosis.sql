CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  storage_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS scans_user_id_created_at_idx ON scans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scans_status_idx ON scans(status);

CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL UNIQUE REFERENCES scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_crop TEXT,
  predicted_disease TEXT,
  scientific_name TEXT,
  severity TEXT,
  confidence NUMERIC(5, 2),
  model_name TEXT,
  model_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  prevention JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT diagnoses_confidence_range CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100))
);
CREATE INDEX IF NOT EXISTS diagnoses_user_id_created_at_idx ON diagnoses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS diagnoses_scan_id_idx ON diagnoses(scan_id);
CREATE INDEX IF NOT EXISTS diagnoses_status_idx ON diagnoses(status);

DROP TRIGGER IF EXISTS scans_set_updated_at ON scans;
CREATE TRIGGER scans_set_updated_at BEFORE UPDATE ON scans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS diagnoses_set_updated_at ON diagnoses;
CREATE TRIGGER diagnoses_set_updated_at BEFORE UPDATE ON diagnoses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
