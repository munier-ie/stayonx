# IMPORTANT: Environment Configuration

## DodPayments API Key Setup

The `.env.local` file needs to be updated with the **live production API key**.

### Required Changes

Add or update these values in `web/.env.local`:

```bash
# DodPayments Live API Key
DODO_PAYMENTS_API_KEY=ArJKUl6tMgjTQxeY.ZIKwBNUKnylAiuBUO1bnVOK0qDjcbiTLXk_qXmZ2X9FivQBi
DODO_PAYMENTS_MODE=live

# Product ID (if not already set)
# DODO_PRODUCT_ID=your_product_id_here
```

### Verification

After updating `.env.local`:

1. Restart the development server:

   ```bash
   cd web
   npm run dev
   ```

2. Check the console logs to confirm it's using "live" mode (not "test" mode)

3. Test the payment flow on the advertise page

### Security Note

⚠️ **NEVER commit `.env.local` to version control** - it's already in `.gitignore`

✅ The live API key should only be used in production environments
❌ Do not share the API key publicly or commit it to the repository

### Existing Variables

The `.env.local` file already contains:

- `PORT=3050`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These should remain unchanged.
