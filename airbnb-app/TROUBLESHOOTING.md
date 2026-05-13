# Troubleshooting Guide

## Error: TanStack Query Error (React Query)

If you see a TanStack/React Query error in the console, follow these steps:

### 1. Check if Backend Server is Running

```bash
# In the airbnb-api directory
cd d:\Downloads\Airbnb\airbnb-api
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected
```

### 2. Check if Frontend is Running

```bash
# In the airbnb-app directory
cd d:\Downloads\Airbnb\airbnb-app
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in xxx ms
Local:   http://localhost:5173/
```

### 3. Verify API URL Configuration

Check `airbnb-app/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Test API Endpoint Manually

Open your browser or Postman and test:
```
GET http://localhost:3000/api/v1/listings
```

**Expected:** JSON response with listings

### 5. Check Browser Console

Open DevTools (F12) and look for:
- ❌ **Network errors** (Failed to fetch, CORS, 404, 500)
- ❌ **Console errors** (JavaScript errors)

### 6. Common Issues & Solutions

#### Issue: "Failed to fetch"
**Cause:** Backend server not running
**Solution:** Start the backend server (`npm run dev` in airbnb-api)

#### Issue: "CORS error"
**Cause:** CORS not configured properly
**Solution:** Check `airbnb-api/src/index.ts` has CORS enabled:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### Issue: "404 Not Found"
**Cause:** API endpoint doesn't exist
**Solution:** Check routes are registered in `airbnb-api/src/index.ts`

#### Issue: "Network request failed"
**Cause:** Wrong API URL
**Solution:** Verify `VITE_API_URL` in `.env` file

### 7. Specific Error: Reviews Not Loading

If reviews specifically aren't loading:

1. **Check if reviews endpoint exists:**
   ```
   GET http://localhost:3000/api/v1/listings/:id/reviews
   ```

2. **Check if reviews routes are registered:**
   - File: `airbnb-api/src/routes/v1/reviews.routes.ts`
   - Should be imported in `airbnb-api/src/index.ts`

3. **Check database:**
   ```bash
   # In airbnb-api directory
   npx prisma studio
   ```
   - Open Prisma Studio
   - Check if `Review` table exists
   - Check if there are any reviews

### 8. Chatbox Error: "Failed to send message"

If the chatbox shows an error:

1. **Check if AI endpoint exists:**
   ```
   POST http://localhost:3000/api/v1/ai/support
   ```

2. **Check if OpenAI API key is configured:**
   - File: `airbnb-api/.env`
   - Should have: `OPENAI_API_KEY=sk-...`

3. **Check AI routes are registered:**
   - File: `airbnb-api/src/routes/v1/ai.routes.ts`
   - Should be imported in `airbnb-api/src/index.ts`

### 9. Clear Cache & Restart

Sometimes a simple restart fixes everything:

```bash
# Stop both servers (Ctrl+C)

# Clear node_modules cache (if needed)
cd d:\Downloads\Airbnb\airbnb-api
rm -rf node_modules
npm install

cd d:\Downloads\Airbnb\airbnb-app
rm -rf node_modules
npm install

# Restart both servers
cd d:\Downloads\Airbnb\airbnb-api
npm run dev

# In another terminal
cd d:\Downloads\Airbnb\airbnb-app
npm run dev
```

### 10. Check Database Connection

```bash
# In airbnb-api directory
npx prisma db push
```

**Expected:** "Database is up to date"

### 11. Run Database Migrations

```bash
# In airbnb-api directory
npx prisma migrate dev
```

### 12. Seed Database (if empty)

```bash
# In airbnb-api directory
npx prisma db seed
```

## Quick Checklist

Before reporting an issue, verify:

- [ ] Backend server is running (`npm run dev` in airbnb-api)
- [ ] Frontend server is running (`npm run dev` in airbnb-app)
- [ ] `.env` files are configured correctly
- [ ] Database is connected (check backend console)
- [ ] No CORS errors in browser console
- [ ] API endpoints return data (test in Postman/browser)
- [ ] No TypeScript errors (`npm run build` in both projects)

## Still Having Issues?

1. **Check the browser console** (F12 → Console tab)
2. **Check the network tab** (F12 → Network tab)
3. **Check the backend logs** (terminal where backend is running)
4. **Take a screenshot** of the error
5. **Note the exact steps** to reproduce the error

## Common Error Messages

### "Cannot read property 'data' of undefined"
**Cause:** API response format doesn't match expected format
**Solution:** Check API response structure matches frontend expectations

### "useQuery is not a function"
**Cause:** React Query not installed or imported incorrectly
**Solution:** 
```bash
npm install @tanstack/react-query
```

### "Module not found: Can't resolve '...'"
**Cause:** Missing import or wrong file path
**Solution:** Check import paths are correct

### "Unexpected token '<'"
**Cause:** API returning HTML instead of JSON (usually 404 page)
**Solution:** Check API endpoint URL is correct

## Environment Variables

### Backend (.env in airbnb-api)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/airbnb"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend (.env in airbnb-app)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

**Last Updated:** May 12, 2026
