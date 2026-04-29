import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getAccountsByCreatedDate from '@salesforce/apex/AccountListByCreatedDateController.getAccountsByCreatedDate';
import getFieldSetMembers from '@salesforce/apex/FieldSetHelper.getFieldSetMembers';

export default class AccountListByCreatedDate extends NavigationMixin(LightningElement) {
    columns = [];
    _accounts;
    _fieldSetMembers;
    
    @api recordLimit = 5;
    
    @wire(getFieldSetMembers, { objectName: 'Account', fieldSetName: 'AccountListFields' })
    wiredFieldSetMembers({ error, data }) {
        if (data) {
            this._fieldSetMembers = data;
            this.buildColumns();
        } else if (error) {
            console.error('Error loading field set:', error);
            this.loadDefaultColumns();
        }
    }

    connectedCallback() {
        // Listen for account save events to refresh the list
        this.template.addEventListener('accountsaved', this.handleAccountSaved.bind(this));
    }
    
    buildColumns() {
        if (!this._fieldSetMembers || this._fieldSetMembers.length === 0) {
            this.loadDefaultColumns();
            return;
        }
        
        this.columns = this._fieldSetMembers.map((field, index) => {
            const column = {
                label: field.label,
                fieldName: field.fieldPath,
                sortable: true
            };
            
            // Special handling for Name field to make it clickable
            if (field.fieldPath === 'Name' && index === 0) {
                column.type = 'button';
                column.typeAttributes = {
                    label: { fieldName: 'Name' },
                    name: 'view_record',
                    variant: 'base'
                };
            }
            // Handle address fields specially
            else if (field.fieldPath.includes('Billing') && (field.fieldPath.includes('Street') || field.fieldPath.includes('City') || field.fieldPath.includes('State') || field.fieldPath.includes('Country') || field.fieldPath.includes('PostalCode'))) {
                column.fieldName = 'formattedAddress';
                column.label = 'Address';
                column.type = 'text';
                column.wrapText = true;
            }
            // Type casting based on field type
            else {
                switch(field.type.toLowerCase()) {
                    case 'currency':
                        column.type = 'currency';
                        column.typeAttributes = {
                            currencyCode: 'USD',
                            minimumFractionDigits: 0
                        };
                        column.cellAttributes = { alignment: 'left' };
                        break;
                    case 'date':
                    case 'datetime':
                        column.type = 'date';
                        column.typeAttributes = {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        };
                        break;
                    case 'percent':
                        column.type = 'percent';
                        break;
                    case 'boolean':
                        column.type = 'boolean';
                        break;
                    case 'url':
                        column.type = 'url';
                        break;
                    case 'email':
                        column.type = 'email';
                        break;
                    case 'phone':
                        column.type = 'phone';
                        break;
                    default:
                        column.type = 'text';
                }
            }
            
            return column;
        });
        
        // Remove duplicate address columns
        const addressIndex = this.columns.findIndex(col => col.fieldName === 'formattedAddress');
        if (addressIndex !== -1) {
            this.columns = this.columns.filter((col, idx) => {
                return !(col.fieldName.includes('Billing') && col.fieldName !== 'formattedAddress' && idx !== addressIndex);
            });
        }
    }
    
    loadDefaultColumns() {
        this.columns = [
            {
                label: 'Account Name',
                fieldName: 'Name',
                type: 'button',
                typeAttributes: {
                    label: { fieldName: 'Name' },
                    name: 'view_record',
                    variant: 'base'
                },
                sortable: true
            },
            {
                label: 'Address',
                fieldName: 'formattedAddress',
                type: 'text',
                wrapText: true
            },
            {
                label: 'Annual Revenue',
                fieldName: 'AnnualRevenue',
                type: 'currency',
                typeAttributes: {
                    currencyCode: 'USD',
                    minimumFractionDigits: 0
                },
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Created Date',
                fieldName: 'CreatedDate',
                type: 'date',
                typeAttributes: {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }
            }
        ];
    }

    @wire(getAccountsByCreatedDate, { recordLimit: '$recordLimit' })
    wiredAccounts(result) {
        this._accounts = result;
    }

    handleAccountSaved() {
        // Refresh the account list when an account is saved
        return refreshApex(this._accounts);
    }

    get accounts() {
        if (this._accounts && this._accounts.data) {
            // Format the address field for display
            const formattedData = this._accounts.data.map(account => {
                return {
                    ...account,
                    formattedAddress: this.formatAddress(account)
                };
            });
            return {
                ...this._accounts,
                data: formattedData
            };
        }
        return this._accounts || {};
    }

    get isLoading() {
        return !this._accounts || (!this._accounts.data && !this._accounts.error);
    }

    get noAccounts() {
        return this._accounts && this._accounts.data && this._accounts.data.length === 0;
    }

    formatAddress(account) {
        const addressParts = [
            account.BillingStreet,
            account.BillingCity,
            account.BillingState,
            account.BillingPostalCode,
            account.BillingCountry
        ].filter(part => part); // Remove null/undefined values

        return addressParts.length > 0 ? addressParts.join(', ') : 'No address available';
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_record') {
            this.navigateToRecord(row.Id);
        }
    }

    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    // Public method to refresh the account list
    @api
    async refreshAccountList() {
        try {
            await refreshApex(this._accounts);
        } catch (error) {
            console.error('Error refreshing account list:', error);
        }
    }
}