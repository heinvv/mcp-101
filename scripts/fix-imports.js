#!/usr/bin/env node
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function fixImportsInFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Fix relative imports that don't end with .js
    const fixedContent = content.replace(
      /from ['"](\.[^'"]*?)(?<!\.js)['"];/g,
      "from '$1.js';"
    );
    
    if (content !== fixedContent) {
      await writeFile(filePath, fixedContent);
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.endsWith('.js')) {
        await fixImportsInFile(fullPath);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error processing directory ${dirPath}:`, error.message);
    }
  }
}

console.log('🔧 Fixing ES module imports in compiled JavaScript...');
await processDirectory(distDir);
console.log('✅ Import fixing completed!');