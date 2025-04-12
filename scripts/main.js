import AmoCrmApiClient from './AmoCrmApiClient.js';
import AmoCrmDealsApp from './AmoCrmDealsApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const accessToken = 'ACCESS_TOKEN';
    const apiClient = new AmoCrmApiClient(accessToken);
    const app = new AmoCrmDealsApp(apiClient);
    
    app.init();
});