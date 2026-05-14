# MqttValidator Refactoring: Supabase Integration Guide

## Overview

The `MqttValidator` class has been refactored to use **Supabase** for user validation instead of hardcoded static arrays. This enables dynamic user management without code changes.

## Key Changes

### 1. **Database Schema**

A new `allowed_users` table has been added to `supabase-schema.sql`:

```sql
CREATE TABLE allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Architecture Changes**

| Aspect          | Before           | After                |
| --------------- | ---------------- | -------------------- |
| Data Storage    | Hardcoded array  | Supabase table       |
| Validation      | Synchronous      | Asynchronous         |
| User Management | Edit code        | Database queries     |
| Performance     | In-memory (fast) | Database (cacheable) |
| Scalability     | Limited          | Unlimited            |

### 3. **Method Signature Changes**

#### Async Methods Now

- `validateUID(uid: string)` - Now async, queries Supabase
- `getUserByUID(uid: string)` - Now async, returns `AllowedUser \| null`
- `addAllowedUser(user: AllowedUser)` - Now async, inserts to Supabase
- `getAllowedUsers()` - Now async, returns array from database

#### Caching

- Results are cached for **60 seconds** to reduce database queries
- Cache is automatically invalidated when users are added

### 4. **Timestamp Format**

- Updated to use **BIGINT (milliseconds)** instead of ISO strings
- Prevents out-of-range errors with future dates
- Format: `Math.floor(Date.now())` - milliseconds since epoch

## Migration Steps

### 1. Create Supabase Tables

Run the updated schema in your Supabase SQL Editor:

```bash
# Copy the schema from supabase-schema.sql
# Navigate to: Supabase Project → SQL Editor → New Query
# Paste and execute the entire schema
```

### 2. Migrate Initial Users

Run the migration script to populate initial users:

```bash
npx tsx scripts/migrate-users-to-supabase.ts
```

Or manually insert users via Supabase:

```sql
INSERT INTO allowed_users (uid, nama) VALUES
  ('E240B8C3', 'Dika'),
  ('E240B8C4', 'User 2');
```

### 3. Update Code References

Any code calling the following methods needs to be updated:

```typescript
// OLD - Synchronous
const users = validator.getAllowedUsers();
const user = validator.getUserByUID("E240B8C3");
validator.addAllowedUser({ uid: "NEW123", nama: "New User" });

// NEW - Asynchronous
const users = await validator.getAllowedUsers();
const user = await validator.getUserByUID("E240B8C3");
await validator.addAllowedUser({ uid: "NEW123", nama: "New User" });
```

### 4. Update API Routes

All API routes using `MqttValidator` must handle async methods:

```typescript
// ✅ CORRECT - GET /api/mqtt/health
export async function GET() {
  const validator = getMqttValidator();
  const users = await validator.getAllowedUsers(); // Added await
  return NextResponse.json({ users });
}

// ❌ WRONG - This will fail
const users = validator.getAllowedUsers(); // Missing await!
```

## Error Handling

The validator gracefully handles database errors:

```typescript
// If Supabase is unavailable:
// - validateUID() returns false
// - getUserByUID() returns null
// - addAllowedUser() logs error but doesn't crash
// - getAllowedUsers() returns empty array

// Errors are logged to console for debugging
```

## Performance Considerations

### Caching

- First request to validate a UID queries Supabase
- Subsequent requests (within 60 seconds) use cache
- Cache is cleared when: (a) 60 seconds pass, (b) user is added

### Database Indexes

```sql
CREATE INDEX idx_allowed_users_uid ON allowed_users(uid);
```

This index ensures O(1) lookups by UID.

### Reducing Load

For high-volume MQTT traffic, the cache significantly reduces database queries:

- 100 messages/minute × 10 unique UIDs = ~10 database queries/minute (with cache)
- vs ~100 queries/minute without cache

## Rollback Plan

If you need to revert to static data:

1. **Restore old MqttValidator.ts** from git history
2. **Remove Supabase calls** from affected files
3. **Revert schema changes** if database tables aren't needed elsewhere

```bash
git checkout HEAD~1 -- src/lib/mqtt-validator.ts
```

## Testing

### Unit Test Example

```typescript
import MqttValidator from "@/lib/mqtt-validator";

// Test async validation
it("should validate UID from Supabase", async () => {
  const validator = new MqttValidator(config);
  const isValid = await validator.validateUID("E240B8C3");
  expect(isValid).toBe(true);
});

// Test error handling
it("should handle database errors gracefully", async () => {
  // Mock Supabase to return error
  const isValid = await validator.validateUID("INVALID");
  expect(isValid).toBe(false);
});
```

### Manual Testing

```bash
# Run the MQTT validator in standalone mode
npx tsx scripts/mqtt-validator.ts

# Test in browser
curl http://localhost:3000/api/mqtt/health
```

## Monitoring & Maintenance

### Health Checks

Monitor the `/api/mqtt/health` endpoint:

```bash
curl http://localhost:3000/api/mqtt/health
# Response: { "status": "healthy", "message": "...", "users": [...] }
```

### Database Monitoring

Check Supabase dashboard:

- **Logs**: Monitor query performance
- **Metrics**: Track row count and storage growth
- **RLS**: Verify security policies

### Common Issues

| Issue                           | Solution                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| UID validation returns false    | Check UID exists in `allowed_users` table                                          |
| Slow validation                 | Check database index on `uid` column                                               |
| "Missing Supabase config" error | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Database connection fails       | Verify Supabase project is active and credentials are correct                      |

## Files Changed

1. **`src/lib/mqtt-validator.ts`** - Main refactoring
   - Removed static array
   - Added Supabase queries
   - Implemented caching
   - Updated timestamps to BIGINT

2. **`src/lib/mqtt-validator.server.ts`** - No changes (still works as-is)

3. **`app/api/mqtt/health/route.ts`** - Updated for async methods

4. **`supabase-schema.sql`** - Added `allowed_users` table

5. **`scripts/migrate-users-to-supabase.ts`** - NEW - Migration helper

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_MQTT_BROKER_URL=your_mqtt_broker_url
NEXT_PUBLIC_MQTT_USERNAME=your_mqtt_username
NEXT_PUBLIC_MQTT_PASSWORD=your_mqtt_password
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. ✅ Set up Supabase `allowed_users` table (use updated schema)
2. ✅ Run migration script to populate initial users
3. ✅ Test MQTT validation with `/api/mqtt/health` endpoint
4. ✅ Monitor logs for any errors
5. ✅ Consider adding user management UI (future enhancement)

## FAQ

**Q: Why use async/await?**
A: Database queries are inherently asynchronous. This prevents blocking the event loop and allows handling multiple requests efficiently.

**Q: What if the database is slow?**
A: The 60-second cache handles temporary slowdowns. For persistent issues, increase cache duration or implement circuit breaker pattern.

**Q: Can I add more user fields?**
A: Yes! Update the schema and `AllowedUser` interface:

```sql
ALTER TABLE allowed_users ADD COLUMN email TEXT;
```

```typescript
interface AllowedUser {
  email?: string; // Add here
}
```

**Q: How do I manage users dynamically?**
A: Via Supabase dashboard or a future admin API. Use `addAllowedUser()` method or direct database access.

---

**Refactored by:** Copilot CLI  
**Date:** 2026-05-14  
**Status:** Ready for production
