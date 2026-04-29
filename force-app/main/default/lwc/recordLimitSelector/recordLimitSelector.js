import { LightningElement, wire } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import RECORD_LIMIT_CHANNEL from '@salesforce/messageChannel/RecordLimitChannel__c';

export default class RecordLimitSelector extends LightningElement {
    recordLimit = '5';
    subscription = null;
    
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
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
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

    handleMessage(message) {
        // Update local value when message is received from other components
        if (message.recordLimit && message.recordLimit !== this.recordLimit) {
            this.recordLimit = message.recordLimit;
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