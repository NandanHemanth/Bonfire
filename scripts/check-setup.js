#!/usr/bin/env node

/**
 * Setup Verification Script for Data Analysis Feature
 * Run: node scripts/check-setup.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Checking Data Analysis Feature Setup...\n');

let allChecksPass = true;

// Check 1: .env file exists
console.log('1️⃣  Checking .env file...');
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Check for GEMINI_API_KEY
  const envContent = readFileSync(envPath, 'utf-8');
  if (envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=your_')) {
    console.log('   ✅ GEMINI_API_KEY is configured');
  } else {
    console.log('   ❌ GEMINI_API_KEY is not configured or using placeholder');
    console.log('      → Get your key from: https://makersuite.google.com/app/apikey');
    allChecksPass = false;
  }
} else {
  console.log('   ❌ .env file not found');
  console.log('      → Copy .env.example to .env');
  allChecksPass = false;
}

// Check 2: Required files exist
console.log('\n2️⃣  Checking required files...');
const requiredFiles = [
  'apps/web/src/components/data/DataAnalyzer.tsx',
  'apps/api/src/routes/data.ts',
  'apps/api/src/services/gemini-data-analyzer.ts',
  'apps/api/src/services/pdf-generator.ts',
  'sample_data.csv',
];

let filesOk = true;
requiredFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} not found`);
    filesOk = false;
    allChecksPass = false;
  }
});

if (filesOk) {
  console.log('   ✅ All required files present');
}

// Check 3: Dependencies
console.log('\n3️⃣  Checking dependencies...');
try {
  const apiPackageJson = JSON.parse(
    readFileSync(join(rootDir, 'apps/api/package.json'), 'utf-8')
  );
  
  const requiredDeps = ['@google/generative-ai', 'jspdf', 'jspdf-autotable'];
  let depsOk = true;
  
  requiredDeps.forEach(dep => {
    if (apiPackageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} not found in package.json`);
      depsOk = false;
      allChecksPass = false;
    }
  });
  
  if (depsOk) {
    console.log('   ✅ All required dependencies listed');
    console.log('      → Run "npm install" if not installed yet');
  }
} catch (error) {
  console.log('   ❌ Could not read package.json');
  allChecksPass = false;
}

// Check 4: API Server
console.log('\n4️⃣  Checking API server...');
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ API server is running on port 3001');
        resolve(true);
      } else {
        console.log(`   ⚠️  API server responded with status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('   ❌ API server is not running on port 3001');
      console.log('      → Start with: npm run dev:api');
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('   ❌ API server connection timeout');
      resolve(false);
    });
  });
};

const serverRunning = await checkServer();
if (!serverRunning) {
  allChecksPass = false;
}

// Check 5: Documentation
console.log('\n5️⃣  Checking documentation...');
const docs = [
  'docs/DATA_ANALYSIS_SETUP.md',
  'docs/DATA_ANALYSIS_USER_GUIDE.md',
  'INSTALL_DATA_ANALYSIS.md',
  'TROUBLESHOOTING.md',
];

let docsOk = true;
docs.forEach(doc => {
  if (existsSync(join(rootDir, doc))) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} not found`);
    docsOk = false;
  }
});

if (docsOk) {
  console.log('   ✅ All documentation present');
}

// Summary
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('✅ All checks passed! You\'re ready to use the Data Analysis feature.');
  console.log('\n📝 Next steps:');
  console.log('   1. Navigate to http://localhost:3000/data-analysis');
  console.log('   2. Upload sample_data.csv');
  console.log('   3. Click "Analyze with Gemini AI"');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\n📚 Resources:');
  console.log('   - Setup Guide: docs/DATA_ANALYSIS_SETUP.md');
  console.log('   - Installation: INSTALL_DATA_ANALYSIS.md');
  console.log('   - Troubleshooting: TROUBLESHOOTING.md');
}
console.log('='.repeat(50) + '\n');

process.exit(allChecksPass ? 0 : 1);
