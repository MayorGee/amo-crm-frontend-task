class AmoCrmDealsApp {
    constructor(apiClient) {
        this.deals = [];
        this.expandedDealId = null;
        this.fetchQueue = [];
        this.isFetching = false;
        this.apiClient = apiClient;
    }

    init() {
        this.loadDeals();
    }

    async loadDeals() {
        try {
            // this.deals = await this.apiClient.getDeals();
            this.deals = this.generateTempDeals();
            this.renderDealsTable();
        } catch (error) {
            console.error('Failed to load deals:', error);
            alert('Failed to load deals. Please try again.');
        }
    }

    generateTempDeals() {
        return [
            {
                id: 1,
                name: 'Deal 1',
                budget: 1000,
                contact: { name: 'Contact 1', phone: '+79854567890' },
                tasks: [{ due_date: this.getFormattedDate(-2), status: 'completed' }]
            },
            {
                id: 2,
                name: 'Deal 2',
                budget: 2000,
                contact: { name: 'Contact 2', phone: '+79045678901' },
                tasks: [{ due_date: this.getFormattedDate(-1), status: 'completed' }]
            },
            {
                id: 3,
                name: 'Deal 3',
                budget: 2500,
                contact: { name: 'Contact 3', phone: '+2345678901' },
                tasks: [{ due_date: this.getFormattedDate(0), status: 'in_progress' }]
            },
            {
                id: 4,
                name: 'Deal 4',
                budget: 12500,
                contact: {},
                tasks: [{ due_date: this.getFormattedDate(+1), status: 'in_progress' }]
            },
            {
                id: 5,
                name: 'Deal 5',
                budget: 9000,
                contact: { name: 'Contact 3', phone: '+2340028910' },
                tasks: [{ due_date: this.getFormattedDate(+2), status: 'in_progress' }]
            },
            {
                id: 6,
                name: 'Deal 6',
                budget: 1500,
                contact: { name: 'Contact 3', phone: '+2341096458' },
                tasks: [{ due_date: this.getFormattedDate(-1), status: 'completed' }]
            }
        ];
    }

    getFormattedDate(daysOffset) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);

        return date.toLocaleDateString('ru-RU');
    }

    renderDealsTable() {
        const tableBody = document.getElementById('dealsTableBody');
        tableBody.innerHTML = '';

        this.deals.forEach(deal => {
            const row = document.createElement('tr');
            row.className = 'deal-row';
            row.dataset.dealId = deal.id;
            row.innerHTML = `
                <td>${deal.id}</td>
                <td>${deal.name}</td>
                <td>${deal.budget}</td>
                <td>${deal.contact?.name || 'N/A'}</td>
                <td>${deal.contact?.phone || 'N/A'}</td>
                <td>${this.renderStatusIndicator(deal)}</td>
            `;
            row.addEventListener('click', () => this.toggleDealExpansion(deal.id));
            tableBody.appendChild(row);
        });
    }

    renderStatusIndicator(deal) {
        if (!deal.tasks || deal.tasks.length == 0) {
            return this.createStatusSvg('red');
        }

        const task = deal.tasks[0];

        const [day, month, year] = task.due_date.split('.');
        const dueDate = new Date(year, month - 1, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const timeDiff = dueDate - today;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        let color = 'red'; // Default (overdue or no task)

        if (daysDiff === 0) {
            color = 'green'; // Today
        } else if (daysDiff > 0) {
            color = 'yellow'; // Future
        }

        return this.createStatusSvg(color);
    }

    createStatusSvg(color) {
        return `<svg class="status-circle" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="6" fill="${color}"/>
                </svg>`;
    }

    async toggleDealExpansion(dealId) {
        if (this.expandedDealId === dealId) {
            this.collapseDeal();
            return;
        }

        this.collapseDeal();
        this.expandedDealId = dealId;

        const row = this.getDealRowElement(dealId); 
        const expandedRow = this.createExpandedRowWithSpinner();
        row.after(expandedRow);

        await this.loadAndRenderDealDetails(dealId, expandedRow);
    }

    getDealRowElement(dealId) {
        return document.querySelector(`tr[data-deal-id="${dealId}"]`);
    }

    createExpandedRowWithSpinner() {
        const row = document.createElement('tr');
        row.className = 'expanded-row';
        row.innerHTML = `
            <td colspan="6">
                <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </td>
        `;
        return row;
    }

    async loadAndRenderDealDetails(dealId, expandedRow) {
        try {
            const deal = await this.fetchDealDetails(dealId);
            this.renderDealDetails(expandedRow, deal);
        } catch (error) {
            console.error('Error fetching deal details:', error);
            this.renderErrorState(expandedRow);
        }
    }

    async fetchDealDetails(dealId) {
        // return await this.apiClient.getDetails(dealId);
        return this.deals.find(deal => deal.id === dealId);
    }

    renderDealDetails(expandedRow, deal) {
        expandedRow.innerHTML = `
            <td colspan="9">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-6">
                            ${this.renderDealInfo(deal)}
                        </div>
                        <div class="col-md-6 text-end">
                            <div class="d-flex align-items-center justify-content-end">
                                ${this.renderStatusIndicator(deal)}
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        `;
    }

    renderDealInfo(deal) {
        return `
            <p><strong>Название:</strong> ${deal.name}</p>
            <p><strong>Бюджет:</strong> ${deal.budget}</p>
            <p><strong>Контакт:</strong> ${deal.contact?.name || 'N/A'}</p>
            <p><strong>Телефон:</strong> ${deal.contact?.phone || 'N/A'}</p>
        `;
    }

    renderErrorState(expandedRow) {
        expandedRow.innerHTML = `
            <td colspan="9">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Название:</strong> N/A</p>
                            <p><strong>Бюджет:</strong> N/A</p>
                            <p><strong>Контакт:</strong> N/A</p>
                            <p><strong>Телефон:</strong> N/A</p>
                        </div>
                        <div class="col-md-6 text-end">
                            <div class="d-flex align-items-center justify-content-end">
                                ${this.createStatusSvg('red')}
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        `;
    }

    collapseDeal() {
        if (!this.expandedDealId) {
            return;
        }

        const expandedRow = document.querySelector(`tr[data-deal-id="${this.expandedDealId}"] + tr.expanded-row`);
        
        if (expandedRow) {
            expandedRow.remove();
        }   

        this.expandedDealId = null;
    }

    async processFetchQueue() {
        if (this.isFetching || this.fetchQueue.length === 0) {
            return;
        }

        this.isFetching = true;
        const task = this.fetchQueue.shift();

        try {
            const result = await task.fn();
            task.resolve(result);
        } catch (error) {
            task.reject(error);
        } finally {
            setTimeout(() => {
                this.isFetching = false;
                this.processFetchQueue();
            }, 1000);
        }
    }

    enqueueFetch(fn) {
        return new Promise((resolve, reject) => {
            this.fetchQueue.push({ fn, resolve, reject });
            this.processFetchQueue();
        });
    }
}

export default AmoCrmDealsApp;