// ERROR FIX GUIDE: 406 Not Acceptable from Supabase

/**
 * The 406 errors indicate Supabase tables are not properly configured.
 * 
 * SOLUTION: Follow these steps to fix the errors:
 */

// STEP 1: Create .env.local file with your Supabase credentials
// ============================================================
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key
// VITE_OPENAI_API_KEY=your-openai-key


// STEP 2: Run the Supabase setup SQL
// ====================================
// 1. Go to: https://app.supabase.com
// 2. Select your project
// 3. Go to SQL Editor
// 4. Create new query
// 5. Copy-paste content from: supabase_setup.sql
// 6. Run the query


// STEP 3: Enable RLS (Row Level Security)
// =========================================
// After tables are created:
// 1. Go to Authentication > Policies
// 2. For each table, create policy:
//    - Allow SELECT to all authenticated users
//    - Allow INSERT/UPDATE/DELETE to owner


// STEP 4: Verify tables exist
// =============================
// Tables needed:
// - user_profiles
// - leaderboard
// - avatar_purchases
// - frame_purchases
// - multiplayer_matches


// QUICK FIX: Disable multiplayer temporarily
// =============================================
// If you don't have Supabase configured yet:

export const DISABLE_MULTIPLAYER = true; // Set to false after Supabase setup

// The app will work in offline mode with local storage
// Multiplayer features will be disabled until Supabase is configured


// STEP 5: Test the setup
// =======================
// 1. Open browser console
// 2. You should see: "✅ Supabase configured - Cloud features enabled"
// 3. If you see warning: "⚠️ Supabase NOT configured"
//    → Check your .env.local file
//    → Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct


// CONFIGURATION CHECKLIST
// ========================
// ☐ .env.local file created with Supabase credentials
// ☐ Tables created via supabase_setup.sql
// ☐ RLS policies configured
// ☐ Credentials are correct (no typos)
// ☐ Environment variables are prefixed with VITE_
// ☐ Dev server restarted after .env.local changes


// If you still get 406 errors after these steps:
// 1. Check Supabase project logs
// 2. Verify table structure in Database > Tables
// 3. Check RLS policies are not blocking requests
// 4. Restart dev server (npm run dev)
