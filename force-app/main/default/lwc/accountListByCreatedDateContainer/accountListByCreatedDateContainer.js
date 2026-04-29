import { LightningElement, wire } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import RECORD_LIMIT_CHANNEL from '@salesforce/messageChannel/RecordLimitChannel__c';
import ACCOUNT_CREATED_CHANNEL from '@salesforce/messageChannel/NewAccountCreatedChannel__c';

export default class AccountListByCreatedDateContainer extends LightningElement {
    recordLimit = '5';
    subscription = null;
    accountCreatedSubscription = null;
    
    @wire(MessageContext)
    messageContext;
    
    limitOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '15', value: '15' },
        { label: '20', value: '20' },
        { label: '25', value: '25' },
        { label: '30', value: '30' }
    ];

    connectedCallback() {
        this.subscribeToMessageChannel();
        this.subscribeToAccountCreatedChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
        this.unsubscribeFromAccountCreatedChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                RECORD_LIMIT_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    unsubscribeToMessageChannel() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
    }
    
    subscribeToAccountCreatedChannel() {
        if (!this.accountCreatedSubscription) {
            this.accountCreatedSubscription = subscribe(
                this.messageContext,
                ACCOUNT_CREATED_CHANNEL,
                (message) => this.handleAccountCreated(message)
            );
        }
    }
    
    unsubscribeFromAccountCreatedChannel() {
        if (this.accountCreatedSubscription) {
            unsubscribe(this.accountCreatedSubscription);
            this.accountCreatedSubscription = null;
        }
    }
    
    handleAccountCreated(message) {
        // Refresh the list when an account is created or updated
        this.refreshAccountList();
    }

    handleMessage(message) {
        // Update local value when message is received from other components
        if (message.recordLimit && message.recordLimit !== this.recordLimit) {
            this.recordLimit = message.recordLimit;
        }
        // Refresh list if account refresh event is received
        if (message.refreshAccounts) {
            this.refreshAccountList();
        }
    }
    
    handleAccountSaved() {
        // Handle the accountsaved event bubbled up from accountForm
        this.refreshAccountList();
    }
    
    refreshAccountList() {
        // Force refresh of the child account list component
        const accountListComponent = this.template.querySelector('c-account-list-by-created-date');
        if (accountListComponent && accountListComponent.refreshAccountList) {
            accountListComponent.refreshAccountList();
        }
    }

    handleLimitChange(event) {
        const newLimit = event.detail.value;
        this.recordLimit = newLimit;
        
        // Publish the change to other components
        this.publishLimitChange(newLimit);
    }

    publishLimitChange(limit) {
        const message = {
            recordLimit: limit
        };
        publish(this.messageContext, RECORD_LIMIT_CHANNEL, message);
    }
}