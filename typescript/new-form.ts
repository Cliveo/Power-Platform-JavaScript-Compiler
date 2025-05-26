// TypeScript Web Resource Template
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
