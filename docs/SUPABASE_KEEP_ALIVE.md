# Supabase Keep-Alive System

**Status:** Active
**File:** `.github/workflows/supabase-keep-alive.yml`

## Background: The 7-Day Inactivity Rule
Supabase Free tier projects are subject to an inactivity lifecycle. If a project has zero interactions with the Supabase **Data API (PostgREST)** or **GraphQL API** for 7 consecutive days, the project is automatically paused. This puts the database and all edge functions into a state of hibernation to conserve compute resources.

When a paused project is manually restored via the Supabase Dashboard, any existing database webhooks (such as the ones driving the `process-submission` edge function for our email system) are often disabled or lose their connection to the underlying trigger. This results in missing automated responses for form submissions.

## The Solution: Automated Ping
To prevent the project from pausing without requiring manual intervention, we utilize a **GitHub Actions workflow** to simulate "activity". 

> **Does this violate the Terms of Service?**
> No. Supabase explicitly checks for API usage. Setting up periodic external chron jobs to "ping" endpoints is a standard community practice for hobby projects and beta environments. Upgrading to a paid Pro tier provides 100% guarantees, but this keep-alive is sufficient for the development phase.

## Technical Details
The `supabase-keep-alive.yml` workflow is scheduled to run every **3 days** (using cron `0 0 */3 * *`). This frequency provides a comfortable buffer (ensuring the action fires twice before the 7-day cutoff), but keeps resource consumption practically invisible.

The action runs a lightweight `curl` command using standard HTTP `GET`:
```bash
curl -s --fail -X GET "https://<PROJECT_URL>/rest/v1/contact_submissions?select=id&limit=1" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <ANON_KEY>"
```

By querying the public `contact_submissions` table for a single ID, we successfully register an event on the Data API, resetting the 7-day inactivity clock. The `--fail` flag ensures the GitHub Action reports a failure if the request is unauthorized or the server is down.

---

## 🔒 Configuration: GitHub Secrets
For this workflow to succeed, GitHub requires the following repository secrets to authenticate the API call.

You **MUST** follow these steps to add the secrets:
1. Go to your repository on **GitHub.com**.
2. Click the **Settings** tab.
3. In the left sidebar under "Security", expand **Secrets and variables** and click **Actions**.
4. Click the green **New repository secret** button.
5. Create the first secret:
   - **Name:** `SUPABASE_URL`
   - **Secret:** `https://your-project-id.supabase.co` (No trailing slash)
6. Click **Add Secret**.
7. Create the second secret:
   - **Name:** `SUPABASE_ANON_KEY`
   - **Secret:** `your-long-anon-key-string`
8. Click **Add Secret**.

> These values are identical to the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` found in your local `.env.local` file.

## Testing the Keep-Alive
You can manually force the workflow to run to verify that your secrets are set up correctly:
1. On GitHub, go to the **Actions** tab.
2. In the left sidebar, click **Supabase Keep-Alive**.
3. On the right side, click the **Run workflow** dropdown button.
4. Select the branch where the file lives (e.g., `feat/supabase-keep-alive` or `main`) and click **Run workflow**.
5. After several seconds, the run will succeed (indicated by a green checkmark), proving the action hit your API successfully.
