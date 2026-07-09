#!/usr/bin/env bash
# =============================================================================
# CentralMax — Railway & Vercel Environment Variables Reference
# =============================================================================
#
# This file is a REFERENCE GUIDE, not meant to be executed.
# Use it to verify that all required environment variables are correctly
# configured in Railway's Variables panel (backend) and Vercel's Environment
# Variables settings (frontend) before deploying.
#
# Service  : centralmax (backend)
# Platform : Railway (backend) · Vercel (frontend)
# Framework: Spring Boot 3 / Java 21 (backend) · React + Vite (frontend)
# =============================================================================

# -----------------------------------------------------------------------------
# RAILWAY — Backend Variables
# Set these in: Railway Dashboard → Project → centralmax service → Variables
# -----------------------------------------------------------------------------

# --- Database (Neon PostgreSQL) -----------------------------------------------
# Full JDBC connection string for the Neon PostgreSQL instance.
# Format: jdbc:postgresql://<host>/<database>?sslmode=require
SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>/<database>?sslmode=require

# Neon database username (usually the project name or a dedicated role).
SPRING_DATASOURCE_USERNAME=<neon-username>

# Neon database password.
SPRING_DATASOURCE_PASSWORD=<neon-password>

# --- Server Configuration -----------------------------------------------------
# Port the Spring Boot application listens on.
# Railway automatically routes traffic to this port via $PORT — keep it 8080.
SERVER_PORT=8080

# --- JWT Configuration --------------------------------------------------------
# Secret key used to sign and verify JWT tokens.
# Must be a long, random, high-entropy string (minimum 32 characters).
# Generate with: openssl rand -hex 64
APP_JWT_SECRET=<your-long-random-secret-here>

# Token validity in milliseconds.
# 3600000  =  1 hour
# 86400000 = 24 hours
APP_JWT_EXPIRATION_MS=3600000

# --- CORS Configuration -------------------------------------------------------
# Comma-separated list of allowed frontend origins.
# Must match the exact URL where the Vercel frontend is deployed (no trailing slash).
# Example for a custom domain: https://centralmax.com.br
# Example for Vercel preview:  https://centralmax.vercel.app
APP_CORS_ALLOWED_ORIGIN=https://<your-vercel-domain>

# --- Storage Configuration (Cloudflare R2) ------------------------------------
# R2 S3-compatible endpoint for your Cloudflare account.
# Format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
APP_STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Name of the R2 bucket used to store product photos and other assets.
APP_STORAGE_BUCKET=<bucket-name>

# R2 API token Access Key ID (generated in Cloudflare Dashboard → R2 → Manage API Tokens).
APP_STORAGE_ACCESS_KEY=<r2-access-key-id>

# R2 API token Secret Access Key paired with the Access Key ID above.
APP_STORAGE_SECRET_KEY=<r2-secret-access-key>

# Public base URL used to build publicly accessible URLs for stored files.
# If using the default R2.dev subdomain: https://pub-<hash>.r2.dev
# If using a custom domain linked to the bucket: https://assets.<your-domain>
APP_STORAGE_PUBLIC_URL=https://pub-<hash>.r2.dev

# =============================================================================
# VERCEL — Frontend Variables
# Set these in: Vercel Dashboard → Project → Settings → Environment Variables
# Apply to: Production (and optionally Preview / Development)
# =============================================================================

# Base URL of the Railway backend API (no trailing slash).
# Must point to the Railway-generated domain or your custom domain.
# Example: https://centralmax-production.up.railway.app/api
VITE_API_URL=https://<railway-service-domain>/api

# WhatsApp number used to receive cart/quote messages from customers.
# Format: country code + area code + number, digits only (no spaces or dashes).
# Example for Brazil: 5517999999999
VITE_WHATSAPP_NUMBER=55<DDD><number>

# =============================================================================
# QUICK CHECKLIST
# =============================================================================
#
# Railway (backend):
#   [ ] SPRING_DATASOURCE_URL       — Neon JDBC URL with ?sslmode=require
#   [ ] SPRING_DATASOURCE_USERNAME  — Neon database user
#   [ ] SPRING_DATASOURCE_PASSWORD  — Neon database password
#   [ ] SERVER_PORT                 — 8080
#   [ ] APP_JWT_SECRET              — Long random string (min 32 chars)
#   [ ] APP_JWT_EXPIRATION_MS       — Token TTL in ms (e.g. 3600000)
#   [ ] APP_CORS_ALLOWED_ORIGIN     — Vercel frontend URL (no trailing slash)
#   [ ] APP_STORAGE_ENDPOINT        — Cloudflare R2 S3 endpoint
#   [ ] APP_STORAGE_BUCKET          — R2 bucket name
#   [ ] APP_STORAGE_ACCESS_KEY      — R2 API token Access Key ID
#   [ ] APP_STORAGE_SECRET_KEY      — R2 API token Secret Access Key
#   [ ] APP_STORAGE_PUBLIC_URL      — Public URL for stored files
#
# Vercel (frontend):
#   [ ] VITE_API_URL                — Railway backend URL + /api
#   [ ] VITE_WHATSAPP_NUMBER        — WhatsApp number (digits only, with country code)
#
# =============================================================================
