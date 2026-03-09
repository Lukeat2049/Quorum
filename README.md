# Quorum v2 — Deploy Guide
## Full auth + multi-team version

---

## What's new in v2
- Landing page with sign up / sign in
- Google or email+password login (via Clerk)
- Multiple teams — each team has its own workspace
- Admin roles replace the PIN system
- Invite codes so teammates can join
- Data stored in a real database (Supabase) — shared across all devices

---

## You'll need accounts at 3 free services

| Service | What it does | Cost |
|---------|-------------|------|
| Clerk | Handles login/signup securely | Free up to 10k users |
| Supabase | Database (stores all team data) | Free tier |
| Vercel | Hosts the app | Free tier ✅ already done |

---

## Step 1 — Set up Clerk (login system) ~5 min

1. Go to **clerk.com** → Sign up
2. Click **Create Application**
3. Name it "Quorum", select **Email** and **Google** as sign-in options → Create
4. You'll land on the dashboard. Find your **Publishable Key** (starts with `pk_test_...`)
5. Copy it — you'll need it later

---

## Step 2 — Set up Supabase (database) ~10 min

1. Go to **supabase.com** → Sign up → New Project
2. Give it a name (e.g. "quorum"), set a database password, choose a region → Create
3. Wait ~2 minutes for it to set up
4. Go to **SQL Editor** in the left sidebar → **New Query**
5. Open the file `SUPABASE_SCHEMA.sql` from this folder (open it in TextEdit or any text editor)
6. Copy the entire contents and paste into Supabase SQL Editor → click **Run**
7. You should see "Success" — this creates all the database tables
8. Go to **Project Settings** → **API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 3 — Push the new code to GitHub ~3 min

Open Terminal, then run:

```bash
cd ~/Downloads/quorum-v2
git init
git add .
git commit -m "v2 with auth and database"
git branch -M main
git remote add origin https://github.com/lukeat2049/quorum.git
git push origin main --force
```

> Note: The `--force` replaces your old v1 code with the new v2 code.
> It'll ask for your GitHub username and personal access token (same as before).

---

## Step 4 — Add environment variables to Vercel ~5 min

1. Go to **vercel.com** → your quorum project → **Settings** → **Environment Variables**
2. Add these 4 variables one by one:

| Name | Value |
|------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key from Step 1 |
| `VITE_SUPABASE_URL` | Your Supabase project URL from Step 2 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2 |
| `GEMINI_API_KEY` | Your Gemini key (same as before) |

3. After adding all 4, go to **Deployments** → click **...** on latest → **Redeploy**

---

## Step 5 — Done! 🎉

Visit your app at **quorum-lac.vercel.app**

- You'll see the new landing page
- Sign up with your email or Google
- Create a team — you'll be the admin
- Share the invite code with your teammates
- They sign up, enter the code on the dashboard, and join your team

---

## How roles work

- **Admin** — created the team. Can see invite code, set meeting duration, remove members, generate executive summary
- **Member** — joined via invite code. Can fill in their own metrics/time/notes, view others' data, use present mode

---

## Changing the invite code

Each team gets a random 6-character invite code when created. Admins can see it in the Admin Settings panel. There's no way to change it yet (but you could delete and recreate the team if needed).

---

## Questions?

The main things that go wrong:
- **Blank screen after deploy** → Usually a missing environment variable. Double-check all 4 are added in Vercel and redeploy.
- **Can't join team** → Make sure the invite code is entered exactly as shown (it's case-insensitive but no spaces)
- **Summary not working** → Check that `GEMINI_API_KEY` is set in Vercel environment variables
