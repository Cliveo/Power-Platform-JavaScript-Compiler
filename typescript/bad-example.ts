// TypeScript Web Resource for Basic API Example
// This replaces the existing JavaScript with better TypeScript implementation

namespace BadExample {
    
    // Configuration interface for API settings
    interface ApiConfig {
        url: string;
        username?: string;
        password?: string;
        timeout: number;
    }
    
    // Default configuration
    const defaultConfig: ApiConfig = {
        url: 'https://api.example.com/data',
        timeout: 10000
    };
    
    /**
     * Securely fetch data from API with proper error handling
     * @param config API configuration
     * @returns Promise with the fetched data
     */
    async function fetchDataSecurely(config: ApiConfig = defaultConfig): Promise<any> {
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            // Prepare headers
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            
            // Add authentication if provided
            if (config.username && config.password) {
                headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
            }
            
            // Make the fetch request
            const response = await fetch(config.url, {
                method: 'GET',
                headers: headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Data fetched successfully:', data);
            return data;
            
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.error('Request timed out');
                    throw new Error('Request timed out. Please try again.');
                } else {
                    console.error('Error fetching data:', error.message);
                    throw error;
                }
            } else {
                console.error('Unknown error:', error);
                throw new Error('An unknown error occurred');
            }
        }
    }
    
    /**
     * Form OnLoad event handler
     * @param executionContext The execution context
     */
    export function formOnLoad(executionContext: Xrm.Events.EventContext): void {
        const formContext = executionContext.getFormContext();
        
        if (!formContext) {
            console.error('Form context not available');
            return;
        }
        
        console.log('Bad Example web resource loaded for entity:', formContext.data.entity.getEntityName());
        
        // Show a notification that the form has loaded
        formContext.ui.setFormNotification(
            'Enhanced TypeScript web resource loaded!',
            'INFO',
            'ts_loaded'
        );
        
        // Clear notification after 3 seconds
        setTimeout(() => {
            formContext.ui.clearFormNotification('ts_loaded');
        }, 3000);
    }
    
    /**
     * Button click handler to fetch data
     */
    export async function fetchApiData(): Promise<void> {
        const formContext = Xrm.Page;
        
        // Show loading notification
        formContext.ui.setFormNotification(
            'Fetching data from API...',
            'INFO',
            'api_loading'
        );
        
        try {
            const data = await fetchDataSecurely();
            
            // Clear loading notification
            formContext.ui.clearFormNotification('api_loading');
            
            // Show success notification
            formContext.ui.setFormNotification(
                'Data fetched successfully!',
                'INFO',
                'api_success'
            );
            
            // You could update form fields here with the fetched data
            // Example: formContext.getAttribute('description')?.setValue(data.description);
            
            setTimeout(() => {
                formContext.ui.clearFormNotification('api_success');
            }, 5000);
            
        } catch (error) {
            // Clear loading notification
            formContext.ui.clearFormNotification('api_loading');
            
            // Show error notification
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            formContext.ui.setFormNotification(
                `Failed to fetch data: ${errorMessage}`,
                'ERROR',
                'api_error'
            );
            
            // Show error dialog for more details
            Xrm.Navigation.openErrorDialog({
                message: `API Error: ${errorMessage}`,
                details: 'Check the browser console for more information.'
            });
        }
    }
    
    /**
     * Utility function to validate configuration
     * @param config Configuration to validate
     */
    function validateConfig(config: Partial<ApiConfig>): ApiConfig {
        if (!config.url) {
            throw new Error('API URL is required');
        }
        
        return {
            url: config.url,
            username: config.username,
            password: config.password,
            timeout: config.timeout || 10000
        };
    }
    
    /**
     * Advanced function to fetch data with custom configuration
     * @param url API URL
     * @param username Optional username
     * @param password Optional password
     */
    export async function fetchWithCredentials(url: string, username?: string, password?: string): Promise<void> {
        try {
            const config = validateConfig({ url, username, password });
            await fetchDataSecurely(config);
        } catch (error) {
            console.error('Failed to fetch with credentials:', error);
            throw error;
        }
    }
}

// Make the namespace available globally for Power Platform
(window as any).BadExample = BadExample;
