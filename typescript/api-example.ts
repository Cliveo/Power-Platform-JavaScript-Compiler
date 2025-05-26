// Sample TypeScript Web Resource demonstrating API calls
// This shows how to make HTTP requests from Power Platform web resources

namespace ApiExample {
    
    // Configuration
    interface ApiConfig {
        baseUrl: string;
        timeout: number;
        headers: Record<string, string>;
    }
    
    // Response interfaces
    interface ApiResponse<T> {
        success: boolean;
        data?: T;
        error?: string;
    }
    
    interface UserData {
        id: string;
        name: string;
        email: string;
    }
    
    const defaultConfig: ApiConfig = {
        baseUrl: 'https://api.example.com',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    /**
     * Generic HTTP request function with proper error handling
     * @param url The URL to call
     * @param options Fetch options
     * @returns Promise with typed response
     */
    async function makeRequest<T>(
        url: string, 
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), defaultConfig.timeout);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultConfig.headers,
                    ...options.headers
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            console.error('API request failed:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    
    /**
     * Fetch user data from API
     * @param userId The user ID to fetch
     */
    export async function fetchUserData(userId: string): Promise<void> {
        const formContext = Xrm.Page;
        
        // Show loading notification
        formContext.ui.setFormNotification(
            'Loading user data...', 
            'INFO', 
            'loading_user_data'
        );
        
        const response = await makeRequest<UserData>(
            `${defaultConfig.baseUrl}/users/${userId}`
        );
        
        // Clear loading notification
        formContext.ui.clearFormNotification('loading_user_data');
        
        if (response.success && response.data) {
            // Update form fields with fetched data
            const nameAttribute = formContext.getAttribute('name');
            const emailAttribute = formContext.getAttribute('emailaddress1');
            
            if (nameAttribute) {
                nameAttribute.setValue(response.data.name);
            }
            
            if (emailAttribute) {
                emailAttribute.setValue(response.data.email);
            }
            
            // Show success notification
            formContext.ui.setFormNotification(
                'User data loaded successfully!',
                'INFO',
                'user_data_success'
            );
            
            setTimeout(() => {
                formContext.ui.clearFormNotification('user_data_success');
            }, 3000);
            
        } else {
            // Show error notification
            formContext.ui.setFormNotification(
                `Failed to load user data: ${response.error}`,
                'ERROR',
                'user_data_error'
            );
        }
    }
    
    /**
     * Form OnLoad event with API integration
     * @param executionContext The execution context
     */
    export function formOnLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        // Get current record ID
        const recordId = formContext.data.entity.getId();
        
        if (recordId) {
            // Remove curly braces from GUID
            const cleanId = recordId.replace(/[{}]/g, '');
            fetchUserData(cleanId);
        }
    }
    
    /**
     * Button click handler for manual data refresh
     */
    export function refreshData(): void {
        const formContext = Xrm.Page;
        const recordId = formContext.data.entity.getId();
        
        if (recordId) {
            const cleanId = recordId.replace(/[{}]/g, '');
            fetchUserData(cleanId);
        } else {
            Xrm.Navigation.openAlertDialog({
                text: 'No record ID available for data refresh',
                title: 'Refresh Error'
            });
        }
    }
}

// Make the namespace available globally
(window as any).ApiExample = ApiExample;
