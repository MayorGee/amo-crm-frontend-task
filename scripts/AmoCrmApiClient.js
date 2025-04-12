class AmoCrmApiClient {
    constructor(accessToken) {
        this.baseUrl = 'https://test.amocrm.ru'; // TODO
        this.accessToken = accessToken;
        this.queue = [];
        this.activeRequests = 0;
        this.maxRequests = 2;
        this.interval = 1000;
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
        };

        return this.request(endpoint, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
    }

    async fetchWithRateLimit(url, options) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
  
    async request(endpoint, options) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                endpoint,
                options,
                resolve,
                reject
            });
            this.processQueue();
        });
    }
  
    processQueue() {
        if (this.activeRequests < this.maxRequests && this.queue.length) {
            const task = this.queue.shift();
            this.activeRequests++;
            
    
            setTimeout(() => {
                this.activeRequests--;
                this.processQueue();
                task.resolve(mockResponseFor(task.endpoint));
            }, this.interval);
        }
    }

    async getDeals(withContacts = true) {
        const deals = await this.makeRequest('/leads?with=contacts');
        if (!withContacts) {
            return deals;
        }
        
        return Promise.all(deals.map(async deal => {
            if (deal.contacts && deal.contacts.length) {
                const contact = await this.getContact(deal.contacts[0].id);
                deal.contact = contact;
            }
            return deal;
        }));
    }

    async getContact(contactId) {
        return this.makeRequest(`/contacts/${contactId}`);
    }
    
    async getDealDetails(dealId) {
        return this.makeRequest(`/leads/${dealId}?with=tasks`);
    }
}

export default AmoCrmApiClient;