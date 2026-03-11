

## Plan: Create Missing Database Tables and Fix Build Errors

The code references database tables and columns that don't exist yet. We need to create them via migrations and fix code that references non-existent columns.

### Database Migrations Needed

**Migration 1: Add missing columns to `profiles`**
- Add `onboarding_completed` (boolean, default false)
- Add `linkedin_url` (text, nullable)

**Migration 2: Create `conversations` table**
- `id` (uuid, PK)
- `participant_1` (uuid, not null) — references auth user
- `participant_2` (uuid, not null) — references auth user
- `project_id` (uuid, nullable, FK to projects)
- `last_message` (text, nullable)
- `last_message_at` (timestamptz, default now)
- `created_at` (timestamptz, default now)
- RLS: users can see/create conversations they're part of

**Migration 3: Create `messages` table**
- `id` (uuid, PK)
- `conversation_id` (uuid, FK to conversations)
- `sender_id` (uuid, not null)
- `content` (text, not null)
- `created_at` (timestamptz, default now)
- RLS: users can see messages in their conversations, insert as themselves
- Enable realtime

**Migration 4: Create `notifications` table**
- `id` (uuid, PK)
- `user_id` (uuid, not null)
- `title` (text)
- `message` (text)
- `read` (boolean, default false)
- `type` (text, nullable)
- `created_at` (timestamptz, default now)
- RLS: users can read/update their own notifications

**Migration 5: Create `payments` table**
- `id` (uuid, PK)
- `payer_id` (uuid, not null)
- `payee_id` (uuid, not null)
- `amount` (numeric, not null)
- `status` (text, default 'pending')
- `project_id` (uuid, nullable)
- `created_at` (timestamptz, default now)
- RLS: users can see payments they're part of

**Migration 6: Create `handy_verifications` table**
- `id` (uuid, PK)
- `handy_id` (uuid, not null)
- `type` (text) — diploma, experience, identity
- `document_url` (text, nullable)
- `status` (text, default 'pending')
- `verified_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now)
- RLS: users can manage their own verifications

### Code Fixes

- **`AuthContext.tsx`**: Make `onboarding_completed` optional in the Profile interface (with fallback to `false`)
- **`OnboardingPage.tsx`**: Remove `specialties` (use `specialty` instead), handle `onboarding_completed` properly
- **`VerificationPage.tsx`**: Align with actual `handy_verifications` table schema
- **`PaymentQRModal.tsx`**: Align with actual `payments` table schema

### Outcome
All build errors resolved, chat/messaging/notifications/payments/verification features properly backed by database tables.

