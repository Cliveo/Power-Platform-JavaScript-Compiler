# TypeScript Development for Power Platform Web Resources

This project provides a complete TypeScript development environment for Power Platform web resources, allowing you to write type-safe code with IntelliSense support and automatically sync compiled JavaScript to your web resource folders.

For a step by step guide check out my blog, it contains images with every step required.

https://www.clive-oldridge.com/azure/2025/05/26/power-platform-typescript-development-workflow.html


## Important

Power Platform git integration must be exported to the folder src for this to work.

## 🚀 Features

- **TypeScript Development**: Write type-safe code with full IntelliSense support
- **XRM Typings**: Complete Dynamics 365/Power Platform API typings included
- **Automatic Compilation**: Compile TypeScript to JavaScript with proper ES2020 targeting
- **Smart Syncing**: Automatically sync compiled files to the correct web resource folders
- **Easy Setup**: Simple commands to create mappings for new web resources
- **Git Integration**: Seamless integration with Power Platform Git export

## 📁 Project Structure

```
├── typescript/              # Your TypeScript source files
│   ├── model-form.ts        # Example: Model form logic
│   └── api-example.ts       # Example: API integration
├── dist/                    # Compiled JavaScript files
├── scripts/                 # Build and sync scripts
├── src/webresources/        # Power Platform web resources (Git export)
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── webresource-mapping.json # Mapping between TS files and web resources
```

## 🛠️ Setup

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Create Your First TypeScript Web Resource**
   ```powershell
   npm run new-webresource
   ```
   This will:
   - Show you all available web resources from Power Platform
   - Let you select which one to create a TypeScript file for
   - Optionally convert existing JavaScript to TypeScript
   - Create the mapping between your TS file and the web resource

3. **Compile TypeScript**
   ```powershell
   npm run compile
   ```

4. **Sync to Web Resources**
   ```powershell
   npm run sync-webresources
   ```

5. **Development Workflow**
   ```powershell
   npm run dev
   ```
   This compiles and syncs in one command.

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile TypeScript files to JavaScript |
| `npm run watch` | Watch TypeScript files and compile on changes |
| `npm run sync-webresources` | Sync compiled JS to web resource folders |
| `npm run new-webresource` | Create mapping for a new web resource |
| `npm run dev` | Compile and sync (development workflow) |
| `npm run build` | Clean and compile everything |
| `npm run clean` | Remove compiled files |

## 🔄 Development Workflow

### For Existing Web Resources

1. **Create TypeScript mapping**:
   ```powershell
   npm run new-webresource
   ```

2. **Edit your TypeScript file** in the `typescript/` folder

3. **Compile and sync**:
   ```powershell
   npm run dev
   ```

4. **Commit changes**:
   ```powershell
   git add .; git commit -m "Updated web resource"; git push
   ```

### For New Web Resources from Power Platform

When you pull new web resources from Power Platform:

1. **Pull latest changes**:
   ```powershell
   git pull
   ```

2. **Create TypeScript mapping** for new web resources:
   ```powershell
   npm run new-webresource
   ```

3. **Start developing** in TypeScript with full type safety!

## 💡 TypeScript Examples

### Basic Form Event Handlers

```typescript
namespace MyWebResource {
    export function formOnLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Type-safe form operations
        const nameAttribute = formContext.getAttribute("name");
        if (nameAttribute) {
            nameAttribute.addOnChange(attributeOnChange);
        }
    }
    
    export function attributeOnChange(executionContext: Xrm.Events.EventContext): void {
        const attribute = executionContext.getEventSource() as Xrm.Attributes.Attribute;
        console.log('Changed:', attribute.getName(), attribute.getValue());
    }
}

// Make available globally
(window as any).MyWebResource = MyWebResource;
```

### API Integration with Error Handling

```typescript
namespace ApiIntegration {
    async function fetchData(url: string): Promise<any> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            Xrm.Navigation.openErrorDialog({ message: 'Failed to fetch data' });
            return null;
        }
    }
    
    export function loadExternalData(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        const recordId = formContext.data.entity.getId();
        
        fetchData(`/api/data/${recordId}`).then(data => {
            if (data) {
                // Update form with fetched data
            }
        });
    }
}
```

## 🔧 Configuration

### TypeScript Configuration (`tsconfig.json`)

The project is configured to:
- Target ES2020 for modern Dataverse development. It provides better language features while still maintaining compatibility.
- Use no module system (for Power Platform compatibility)
- Include XRM typings
- Output to `dist/` folder
- Preserve comments for debugging

### Web Resource Mapping (`webresource-mapping.json`)

This file maps your TypeScript files to Power Platform web resources:

```json
{
  "model-form.ts": "b5a4c6d9-aaec-ef11-be20-000d3ad0347e",
  "api-example.ts": "55a4bea9-aaec-ef11-be20-000d3ad0347e"
}
```

## 🎯 Best Practices

1. **Use Namespaces**: Wrap your code in namespaces to avoid global conflicts
2. **Type Safety**: Leverage TypeScript's type system for safer code
3. **Error Handling**: Always handle errors gracefully with try-catch blocks
4. **Async Operations**: Use async/await for better readability
5. **Form Context**: Always check if form context is available before using
6. **Console Logging**: Use console.log for debugging (visible in browser dev tools)

## 🔍 Troubleshooting

### Common Issues

1. **"No mapping found" warning**:
   - Run `npm run new-webresource` to create mapping

2. **Compilation errors**:
   - Check TypeScript syntax
   - Ensure XRM typings are properly imported

3. **Sync failures**:
   - Verify web resource folders exist
   - Check file permissions

4. **Runtime errors in Power Platform**:
   - Check browser console for detailed errors
   - Ensure compiled JavaScript is ES2020 compatible

### Debug Mode

Enable watch mode for continuous development:

```powershell
npm run watch
```

This will automatically recompile TypeScript files when you save changes.

## 📚 Resources

- [XRM TypeScript Definitions](https://www.npmjs.com/package/@types/xrm)
- [Power Platform Web Resources Documentation](https://docs.microsoft.com/en-us/power-apps/developer/model-driven-apps/web-resources)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Feel free to improve this development setup by:
- Adding more example TypeScript files
- Improving the build scripts
- Adding additional tooling

---

Happy coding with TypeScript and Power Platform! 🎉
