#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

const WEBRESOURCES_DIR = './src/webresources';
const DIST_DIR = './dist';
const CONFIG_FILE = './webresource-mapping.json';

// Load the mapping configuration
function loadMapping() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.log(chalk.yellow('No webresource-mapping.json found. Creating default mapping...'));
        return {};
    }
    
    try {
        const content = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(chalk.red('Error reading mapping file:'), error.message);
        return {};
    }
}

// Save the mapping configuration
function saveMapping(mapping) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(mapping, null, 2));
}

// Get all TypeScript files that were compiled
function getCompiledFiles() {
    if (!fs.existsSync(DIST_DIR)) {
        console.log(chalk.yellow('No dist directory found. Run npm run compile first.'));
        return [];
    }
    
    return glob.sync(`${DIST_DIR}/**/*.js`);
}

// Get all web resource directories
function getWebResourceDirs() {
    if (!fs.existsSync(WEBRESOURCES_DIR)) {
        console.log(chalk.red('Web resources directory not found!'));
        return [];
    }
    
    return fs.readdirSync(WEBRESOURCES_DIR)
        .filter(dir => fs.statSync(path.join(WEBRESOURCES_DIR, dir)).isDirectory());
}

// Read web resource metadata
function getWebResourceInfo(webResourceDir) {
    const ymlPath = path.join(WEBRESOURCES_DIR, webResourceDir, 'webresource.yml');
    if (!fs.existsSync(ymlPath)) {
        return null;
    }
    
    const content = fs.readFileSync(ymlPath, 'utf8');
    const nameMatch = content.match(/Name:\s*(.+)/);
    const displayNameMatch = content.match(/DisplayName:\s*(.+)/);
    const fileNameMatch = content.match(/FileName:\s*(.+)/);
    
    return {
        dir: webResourceDir,
        name: nameMatch ? nameMatch[1].trim() : null,
        displayName: displayNameMatch ? displayNameMatch[1].trim() : null,
        fileName: fileNameMatch ? fileNameMatch[1].trim() : null
    };
}

// Copy file and update mapping
function syncFile(sourceFile, targetDir, mapping) {
    const fileName = path.basename(sourceFile);
    const relativePath = path.relative(DIST_DIR, sourceFile);
    const tsFileName = relativePath.replace('.js', '.ts');
    
    // Find the actual JS file in the target directory
    const webResourceFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.js'));
    
    if (webResourceFiles.length === 0) {
        console.log(chalk.yellow(`No JS files found in ${targetDir}`));
        return false;
    }
    
    const targetFile = path.join(targetDir, webResourceFiles[0]);
    
    try {
        fs.copyFileSync(sourceFile, targetFile);
        
        // Update mapping
        const webResourceDir = path.basename(targetDir);
        mapping[tsFileName] = webResourceDir;
        
        console.log(chalk.green(`✓ Synced ${fileName} → ${path.basename(targetFile)}`));
        return true;
    } catch (error) {
        console.error(chalk.red(`✗ Failed to sync ${fileName}:`), error.message);
        return false;
    }
}

// Main sync function
function syncWebResources() {
    console.log(chalk.blue('🔄 Syncing compiled TypeScript files to web resources...\n'));
    
    const mapping = loadMapping();
    const compiledFiles = getCompiledFiles();
    const webResourceDirs = getWebResourceDirs();
    
    if (compiledFiles.length === 0) {
        console.log(chalk.yellow('No compiled files found. Run npm run compile first.'));
        return;
    }
    
    console.log(chalk.cyan('Available web resources:'));
    webResourceDirs.forEach((dir, index) => {
        const info = getWebResourceInfo(dir);
        console.log(`${index + 1}. ${info?.name || dir} (${info?.displayName || 'No display name'})`);
    });
    console.log();
    
    let syncCount = 0;
    
    for (const compiledFile of compiledFiles) {
        const relativePath = path.relative(DIST_DIR, compiledFile);
        const tsFileName = relativePath.replace('.js', '.ts');
        
        // Check if we have a mapping for this file
        if (mapping[tsFileName]) {
            const webResourceDir = mapping[tsFileName];
            const targetDir = path.join(WEBRESOURCES_DIR, webResourceDir);
            
            if (fs.existsSync(targetDir)) {
                if (syncFile(compiledFile, targetDir, mapping)) {
                    syncCount++;
                }
            } else {
                console.log(chalk.yellow(`⚠ Mapped web resource directory not found: ${webResourceDir}`));
                delete mapping[tsFileName];
            }
        } else {
            console.log(chalk.yellow(`⚠ No mapping found for ${tsFileName}. Use 'npm run new-webresource' to create mapping.`));
        }
    }
    
    saveMapping(mapping);
    
    console.log(chalk.blue(`\n🎉 Sync complete! ${syncCount} file(s) synced.`));
    
    if (syncCount > 0) {
        console.log(chalk.gray('\nTo commit changes:'));
        console.log(chalk.gray('git add .; git commit -m "Updated web resources"; git push'));
    }
}

// Run the sync
syncWebResources();
