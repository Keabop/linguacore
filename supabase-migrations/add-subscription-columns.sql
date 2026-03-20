-- ============================================
-- Migration: Add subscription columns to profiles
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================

-- Subscription tier (free or pro)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free'
CHECK (tier IN ('free', 'pro'));

-- Mercado Pago subscription ID (for cancel/reactivate)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Subscription status tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'cancelled', 'pending'));

-- Trial support (optional, for future use)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
