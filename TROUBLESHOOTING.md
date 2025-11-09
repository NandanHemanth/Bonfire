# Troubleshooting Guide - Data Analysis Feature

## Common Issues and Solutions

### 1. Error 500 (Internal Server Error)

**Symptoms:**
- Browser console shows: `Failed to load resource: the server responded with a status of 500`
- Analysis fails after clicking "Analyze with Gemini AI"

**Possible Causes & Solutions:**

#### A. Gemini API Key Not Configured
**Check:**
```bash
# Verify .env file has GEMINI_API_KEY (in project root)
cat .env | grep GEMINI_API_KEY

# Or check from API directory
cat ../../.env | grep GEMINI_API_KEY
```

**Solution:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env` file **in the project root** (not in apps/api):
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Restart API server (the server loads .env from project root)
4. Check server logs - should show "🤖 Gemini API Key: ✅ Configured"

#### B. Invalid CSV Data
**Check:**
- CSV has headers in first row
- No empty rows at the beginning
- Proper comma separation

**Solution:**
- Use the provided `sample_data.csv` to test
- Ensure your CSV is properly formatted

#### C. API Server Not Restarted After Changes
**Solution:**
```bash
# Stop the API server (Ctrl+C)
# Restart it
cd apps/api
npm run dev
```

#### D. Missing Dependencies
**Check:**
```bash
cd apps/api
npm list @google/generative-ai jspdf jspdf-autotable
```

**Solution:**
```bash
cd apps/api
npm install
```

### 2. Error: Connection Refused (Port 3001)

**Symptoms:**
- `net::ERR_CONNECTION_REFUSED`
- Cannot reach localhost:3001

**Solution:**
```bash
# Start the API server
cd apps/api
npm run dev

# Or start all services
npm run dev:all
```

### 3. PDF Not Downloading

**Symptoms:**
- Analysis completes but no PDF downloads

**Solutions:**
1. Check browser download settings
2. Allow popups for localhost
3. Check browser console for errors
4. Try different browser

### 4. Slow Analysis (>60 seconds)

**Causes:**
- Large CSV file (>10,000 rows)
- Gemini API rate limits
- Network issues

**Solutions:**
1. Sample your data (use first 5000 rows)
2. Wait and retry
3. Check internet connection

### 5. "Failed to parse Gemini response"

**Causes:**
- Gemini API returned unexpected format
- API rate limit reached
- Network timeout

**Solutions:**
1. Check API server logs for details
2. Wait a few minutes and retry
3. Verify API key is valid
4. The system will fall back to basic statistics

## Debugging Steps

### Step 1: Check API Server Logs
Look for error messages in the terminal where API server is running:
```
Error analyzing data: [error details]
```

### Step 2: Test API Endpoint Directly
```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123.45}
```

### Step 3: Verify Environment Variables
```bash
# Check if API key is loaded
cd apps/api
node -e "require('dotenv').config(); console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET')"
```

### Step 4: Test with Sample Data
1. Use the provided `sample_data.csv`
2. If it works, issue is with your CSV format
3. If it fails, issue is with configuration

### Step 5: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

## Error Messages Explained

### "GEMINI_API_KEY is not configured"
- API key missing from .env file
- Solution: Add GEMINI_API_KEY to .env

### "No data provided"
- CSV parsing failed
- Solution: Check CSV format

### "No columns found in data"
- CSV has no headers
- Solution: Add header row to CSV

### "Failed to parse Gemini response - no JSON found"
- Gemini returned unexpected format
- Solution: System will use fallback analysis

### "Gemini response missing required fields"
- Incomplete response from Gemini
- Solution: Retry or use fallback

## Getting Help

### Check Logs
**API Server:**
- Look at terminal where `npm run dev` is running
- Check for error stack traces

**Browser:**
- Open DevTools Console (F12)
- Check Network tab for failed requests

### Verify Setup
```bash
# 1. Check Node version (should be 18+)
node --version

# 2. Check if dependencies installed
cd apps/api
npm list

# 3. Check if .env exists
ls -la .env

# 4. Check if API server is running
curl http://localhost:3001/health
```

### Test Gemini API Key
Create a test file `test-gemini.js`:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent('Say hello');
const response = await result.response;
console.log('Gemini works!', response.text());
```

Run:
```bash
cd apps/api
node test-gemini.js
```

## Still Having Issues?

1. **Read the documentation:**
   - `docs/DATA_ANALYSIS_SETUP.md`
   - `docs/DATA_ANALYSIS_USER_GUIDE.md`
   - `INSTALL_DATA_ANALYSIS.md`

2. **Check sample data:**
   - Try with `sample_data.csv` first
   - Verify it works before using your own data

3. **Restart everything:**
   ```bash
   # Kill all processes
   npx kill-port 3000
   npx kill-port 3001
   
   # Reinstall dependencies
   npm install
   
   # Start fresh
   npm run dev:all
   ```

4. **Check GitHub Issues:**
   - Search for similar problems
   - Create new issue with error details

## Quick Fixes Checklist

- [ ] GEMINI_API_KEY is set in .env
- [ ] API server is running on port 3001
- [ ] Web app is running on port 3000
- [ ] Dependencies are installed (`npm install`)
- [ ] CSV file has headers in first row
- [ ] Browser allows downloads from localhost
- [ ] No firewall blocking localhost:3001
- [ ] Internet connection is working
- [ ] Gemini API key is valid

## Success Indicators

✅ API health check returns 200
✅ Can upload CSV file
✅ Analysis starts (loading indicator shows)
✅ Results appear on screen
✅ PDF downloads automatically
✅ No errors in browser console
✅ No errors in API server logs

If all checks pass, the feature is working correctly!
