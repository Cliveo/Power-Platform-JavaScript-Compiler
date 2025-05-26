// Sample TypeScript Web Resource for Model Form
// This demonstrates best practices for Power Platform development

namespace ModelForm {
    
    // Constants
    const PROGRESS_ID = "modelFormProgress";
    const PROGRESS_MESSAGE = "Processing your request...";
    
    /**
     * Form OnLoad event handler
     * Displays a progress notification for 15 seconds, then shows completion message
     * @param executionContext The execution context passed by the platform
     */
    export function formOnLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Type-safe access to form context
        if (!formContext) {
            console.error('Form context is not available');
            return;
        }
        
        // Display the form level notification as an INFO
        formContext.ui.setFormNotification(PROGRESS_MESSAGE, "INFO", PROGRESS_ID);
        
        // Wait for 15 seconds before clearing the notification and showing completion message
        setTimeout(() => {
            formContext.ui.clearFormNotification(PROGRESS_ID);
            
            // Show completion dialog
            Xrm.Navigation.openAlertDialog({
                text: "15 seconds has passed!",
                title: "Timer Complete"
            }).then(
                () => console.log('Dialog closed'),
                (error) => console.error('Dialog error:', error)
            );
        }, 15000);
        
        // Log form information
        console.log('Model form loaded:', {
            entityName: formContext.data.entity.getEntityName(),
            entityId: formContext.data.entity.getId(),
            formType: formContext.ui.getFormType()
        });
    }
    
    /**
     * Form OnSave event handler
     * @param executionContext The execution context passed by the platform
     */
    export function formOnSave(executionContext: Xrm.Events.SaveEventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Add any save validation logic here
        console.log('Model form saving');
        
        // Example: Prevent save under certain conditions
        // const saveEvent = executionContext.getEventArgs();
        // saveEvent.preventDefault();
    }
    
    /**
     * Attribute OnChange event handler
     * @param executionContext The execution context passed by the platform
     */
    export function attributeOnChange(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        const attribute = executionContext.getEventSource() as Xrm.Attributes.Attribute;
        
        if (!attribute) {
            console.error('Attribute is not available');
            return;
        }
          console.log('Attribute changed:', {
            name: attribute.getName(),
            value: attribute.getValue(),
            isDirty: attribute.getIsDirty()
        });
        
        // Add your attribute change logic here
    }
    
    /**
     * Utility function to get current user information
     */
    export function getCurrentUserInfo(): Xrm.UserSettings {
        return Xrm.Utility.getGlobalContext().userSettings;
    }
    
    /**
     * Utility function to show a notification with auto-dismiss
     * @param message The message to display
     * @param level The notification level
     * @param timeout Timeout in milliseconds (default: 5000)
     */
    export function showNotification(
        message: string, 
        level: Xrm.FormNotificationLevel = "INFO", 
        timeout: number = 5000
    ): void {
        const notificationId = `notification_${Date.now()}`;
        const formContext = Xrm.Page; // Fallback to global Xrm.Page if needed
        
        if (formContext && formContext.ui) {
            formContext.ui.setFormNotification(message, level, notificationId);
            
            setTimeout(() => {
                formContext.ui.clearFormNotification(notificationId);
            }, timeout);
        }
    }
}

// Make the namespace available globally for Power Platform
(window as any).ModelForm = ModelForm;
