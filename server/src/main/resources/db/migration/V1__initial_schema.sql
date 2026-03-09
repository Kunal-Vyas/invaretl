-- V1__initial_schema.sql
-- Initial schema for InvarETL
-- Managed by Flyway; do NOT modify this file after it has been applied.
-- To alter the schema, create a new migration: V2__description.sql

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- metadata
-- A generic key/value store for application-level configuration and state.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metadata (
    id         UUID                     DEFAULT uuid_generate_v4() PRIMARY KEY,
    key        VARCHAR(255)             NOT NULL,
    value      TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_metadata_key ON metadata (key);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_metadata_updated_at
    BEFORE UPDATE ON metadata
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
