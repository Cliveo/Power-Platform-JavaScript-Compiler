#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

const WEBRESOURCES_DIR = './src/webresources';
const TYPESCRIPT_DIR = './typescript';
const CONFIG_FILE = './webresource-mapping.json';

// Load the mapping configuration
function loadMapping() {
    if (!fs.existsSync(CONFIG_FILE)) {
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

// Convert existing JS to TypeScript template
function convertJsToTs(jsFilePath) {
    if (!fs.existsSync(jsFilePath)) {
        return getDefaultTemplate();
    }
    
    const jsContent = fs.readFileSync(jsFilePath, 'utf8');
    
    // Add TypeScript-specific improvements
    let tsContent = `// TypeScript version of ${path.basename(jsFilePath)}
// Auto-generated from existing JavaScript web resource

${jsContent}

// TypeScript exports for better development experience
// Uncomment and modify as needed:
// export { };
`;
    
    return tsContent;
}

// Get default TypeScript template
function getDefaultTemplate() {
    return `// TypeScript Web Resource Template
// This file will be compiled and synced to your Power Platform web resource

// Define a namespace for your web resource
namespace WebResource {
    
    /**
     * Form OnLoad event handler
     * @param executionContext The execution context passed by the platform
     */
    export function onLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Your OnLoad logic here
        console.log('Form loaded:', formContext.data.entity.getEntityName());
        
        // Example: Show a notification
        formContext.ui.setFormNotification(
            'Web resource loaded successfully!',
            'INFO',
            'webresource_loaded'
        );
        
        // Clear notification after 3 seconds
        setTimeout(() => {
            formContext.ui.clearFormNotification('webresource_loaded');
        }, 3000);
    }
    
    /**
     * Form OnSave event handler
     * @param executionContext The execution context passed by the platform
     */
    export function onSave(executionContext: Xrm.Events.SaveEventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Your OnSave logic here
        console.log('Form saving:', formContext.data.entity.getEntityName());
    }
    
    /**
     * Attribute OnChange event handler
     * @param executionContext The execution context passed by the platform
     */
    export function onChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        const attribute = executionContext.getEventSource() as Xrm.Attributes.Attribute;
        
        // Your OnChange logic here
        console.log('Attribute changed:', attribute.getName(), attribute.getValue());
    }
}

// Make functions available globally for Power Platform
(window as any).WebResource = WebResource;
`;
}

// Main function to create new TypeScript file
async function createNewWebResource() {
    console.log(chalk.blue('🚀 Create new TypeScript web resource mapping\n'));
    
    const webResourceDirs = getWebResourceDirs();
    const mapping = loadMapping();
    
    if (webResourceDirs.length === 0) {
        console.log(chalk.red('No web resource directories found!'));
        console.log(chalk.yellow('Make sure you have pulled the latest changes from Power Platform.'));
        return;
    }
    
    // Show available web resources
    const choices = webResourceDirs.map(dir => {
        const info = getWebResourceInfo(dir);
        return {
            name: `${info?.name || dir} - ${info?.displayName || 'No display name'} (${dir})`,
            value: dir,
            short: info?.name || dir
        };
    });
    
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'webResourceDir',
            message: 'Select the web resource to create TypeScript mapping for:',
            choices: choices,
            pageSize: 10
        },
        {
            type: 'input',
            name: 'tsFileName',
            message: 'Enter the TypeScript file name (without .ts extension):',
            default: (answers) => {
                const info = getWebResourceInfo(answers.webResourceDir);
                return info?.name?.replace(/^co_/, '') || 'webresource';
            },
            validate: (input) => {
                if (!input || input.trim().length === 0) {
                    return 'File name is required';
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(input.trim())) {
                    return 'File name can only contain letters, numbers, underscores, and hyphens';
                }
                return true;
            }
        },
        {
            type: 'confirm',
            name: 'convertExisting',
            message: 'Convert existing JavaScript content to TypeScript?',
            default: true
        }
    ]);
    
    const { webResourceDir, tsFileName, convertExisting } = answers;
    const tsFilePath = path.join(TYPESCRIPT_DIR, `${tsFileName.trim()}.ts`);
    
    // Check if TypeScript file already exists
    if (fs.existsSync(tsFilePath)) {
        const overwrite = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `TypeScript file ${tsFileName}.ts already exists. Overwrite?`,
                default: false
            }
        ]);
        
        if (!overwrite.overwrite) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
        }
    }
    
    // Create TypeScript content
    let tsContent;
    if (convertExisting) {
        // Find existing JS file
        const webResourcePath = path.join(WEBRESOURCES_DIR, webResourceDir);
        const jsFiles = fs.readdirSync(webResourcePath).filter(f => f.endsWith('.js'));
        
        if (jsFiles.length > 0) {
            const jsFilePath = path.join(webResourcePath, jsFiles[0]);
            tsContent = convertJsToTs(jsFilePath);
        } else {
            tsContent = getDefaultTemplate();
        }
    } else {
        tsContent = getDefaultTemplate();
    }
    
    // Create the TypeScript file
    fs.writeFileSync(tsFilePath, tsContent);
    
    // Update mapping
    const relativeTsPath = `${tsFileName.trim()}.ts`;
    mapping[relativeTsPath] = webResourceDir;
    saveMapping(mapping);
    
    console.log(chalk.green(`✅ Created TypeScript file: ${relativeTsPath}`));
    console.log(chalk.green(`✅ Mapped to web resource: ${webResourceDir}`));
    
    const info = getWebResourceInfo(webResourceDir);
    if (info) {
        console.log(chalk.cyan(`\nWeb Resource Info:`));
        console.log(chalk.cyan(`  Name: ${info.name}`));
        console.log(chalk.cyan(`  Display Name: ${info.displayName}`));
        console.log(chalk.cyan(`  File: ${info.fileName}`));
    }
    
    console.log(chalk.blue(`\n📝 Next steps:`));
    console.log(chalk.gray(`1. Edit your TypeScript file: ${tsFilePath}`));
    console.log(chalk.gray(`2. Compile: npm run compile`));
    console.log(chalk.gray(`3. Sync: npm run sync-webresources`));
    console.log(chalk.gray(`4. Commit: git add .; git commit -m "Updated web resource"; git push`));
}

// Run the script
createNewWebResource().catch(console.error);
