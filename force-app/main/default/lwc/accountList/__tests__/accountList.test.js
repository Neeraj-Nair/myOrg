import { createElement } from 'lwc';
import AccountList from 'c/accountList';
import getRecentlyViewedAccounts from '@salesforce/apex/AccountListController.getRecentlyViewedAccounts';

// Mock realistic data
const mockAccounts = [
    {
        Id: '001000000000001',
        Name: 'Test Account 1',
        BillingStreet: '123 Main St',
        BillingCity: 'San Francisco',
        BillingState: 'CA',
        BillingPostalCode: '94105',
        BillingCountry: 'USA',
        AnnualRevenue: 1000000
    },
    {
        Id: '001000000000002',
        Name: 'Test Account 2',
        BillingStreet: '456 Oak Ave',
        BillingCity: 'New York',
        BillingState: 'NY',
        BillingPostalCode: '10001',
        BillingCountry: 'USA',
        AnnualRevenue: 2000000
    }
];

const mockEmptyAccounts = [];

// Mock Apex wire adapter
jest.mock(
    '@salesforce/apex/AccountListController.getRecentlyViewedAccounts',
    () => {
        const {
            createApexTestWireAdapter
        } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

describe('c-account-list', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty
    async function flushPromises() {
        return Promise.resolve();
    }

    it('displays account data in a datatable', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getRecentlyViewedAccounts.emit(mockAccounts);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Query for datatable element
        const datatableEl = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatableEl).not.toBeNull();
        expect(datatableEl.data.length).toBe(2);
    });

    it('displays error message when wire returns error', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Emit error from @wire
        getRecentlyViewedAccounts.error({
            body: { message: 'An error occurred' }
        });

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Check for error message
        const errorEl = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toContain('An error occurred');
    });

    it('displays no accounts message when data is empty', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Emit empty data from @wire
        getRecentlyViewedAccounts.emit(mockEmptyAccounts);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Check for no accounts message
        const noAccountsEl = element.shadowRoot.querySelector('.slds-text-align_center');
        expect(noAccountsEl).not.toBeNull();
        expect(noAccountsEl.textContent).toContain('No recently viewed accounts found');
    });

    it('formats address correctly', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getRecentlyViewedAccounts.emit(mockAccounts);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Query for datatable element and check data
        const datatableEl = element.shadowRoot.querySelector('lightning-datatable');
        expect(datatableEl.data[0].formattedAddress).toBe(
            '123 Main St, San Francisco, CA, 94105, USA'
        );
    });

    it('handles row action for navigation', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getRecentlyViewedAccounts.emit(mockAccounts);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Create mock navigate function
        const navigateMock = jest.fn();
        element[Symbol.for('NavigationMixin.Navigate')] = navigateMock;

        // Query for datatable and trigger row action
        const datatableEl = element.shadowRoot.querySelector('lightning-datatable');
        datatableEl.dispatchEvent(
            new CustomEvent('rowaction', {
                detail: {
                    action: { name: 'view_record' },
                    row: mockAccounts[0]
                }
            })
        );

        // Verify navigation was called with correct parameters
        expect(navigateMock).toHaveBeenCalledWith({
            type: 'standard__recordPage',
            attributes: {
                recordId: '001000000000001',
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    });

    it('accepts and uses recordLimit property', async () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        element.recordLimit = 10;
        document.body.appendChild(element);

        // Emit data from @wire
        getRecentlyViewedAccounts.emit(mockAccounts);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Verify recordLimit is set
        expect(element.recordLimit).toBe(10);
    });

    it('has correct column configuration', () => {
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);

        // Get columns from the component
        const datatableEl = element.shadowRoot.querySelector('lightning-datatable');
        
        // Check that columns are defined
        expect(datatableEl.columns).toBeDefined();
        expect(datatableEl.columns.length).toBe(3);
        
        // Verify column labels
        expect(datatableEl.columns[0].label).toBe('Account Name');
        expect(datatableEl.columns[1].label).toBe('Address');
        expect(datatableEl.columns[2].label).toBe('Annual Revenue');
    });
});
