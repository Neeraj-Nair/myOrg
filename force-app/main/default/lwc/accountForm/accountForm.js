import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { publish, MessageContext } from 'lightning/messageService';
import ACCOUNT_CREATED_CHANNEL from '@salesforce/messageChannel/NewAccountCreatedChannel__c';

export default class AccountForm extends LightningElement {
    @api recordId;
    showSuccessMessage = false;
    successMessage = '';
    _timeoutId;
    
    @wire(MessageContext)
    messageContext;

    get cardTitle() {
        return this.recordId ? 'Edit Account' : 'Create New Account';
    }

    get submitButtonLabel() {
        return this.recordId ? 'Update Account' : 'Create Account';
    }

    handleSuccess(event) {
        const recordId = event.detail.id;
        const isUpdate = !!this.recordId;
        
        // Show success message
        this.successMessage = isUpdate 
            ? 'Account updated successfully!' 
            : 'Account created successfully!';
        this.showSuccessMessage = true;

        // Show toast notification
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: this.successMessage,
                variant: 'success'
            })
        );

        // Notify the system that record has been updated
        // This will refresh wire adapters watching this record
        notifyRecordUpdateAvailable([{ recordId: recordId }]);

        // Dispatch refresh event to update any listening components
        this.dispatchEvent(new CustomEvent('accountsaved', {
            bubbles: true,
            composed: true,
            detail: { 
                recordId: recordId,
                isUpdate: isUpdate
            }
        }));

        // Hide success message after 3 seconds
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._timeoutId = setTimeout(() => {
            this.showSuccessMessage = false;
        }, 3000);

        // Dispatch event for form reset if creating new record
        if (!isUpdate) {
            this.dispatchEvent(new CustomEvent('recordcreated', {
                detail: { recordId: recordId }
            }));
        }
        
        // Publish message via LMS to notify other components
        this.publishAccountSaved(recordId, isUpdate);
    }
    
    publishAccountSaved(recordId, isUpdate) {
        const message = {
            recordId: recordId,
            isUpdate: isUpdate,
            timestamp: new Date().getTime()
        };
        publish(this.messageContext, ACCOUNT_CREATED_CHANNEL, message);
    }

    handleError(event) {
        const error = event.detail;
        let errorMessage = 'An error occurred while saving the account.';
        
        if (error && error.detail) {
            errorMessage = error.detail;
        } else if (error && error.message) {
            errorMessage = error.message;
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: errorMessage,
                variant: 'error',
                mode: 'sticky'
            })
        );
    }

    handleCancel() {
        // Dispatch custom event to notify parent components
        this.dispatchEvent(new CustomEvent('cancel'));
        
        // Show toast
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Cancelled',
                message: 'Operation cancelled',
                variant: 'info'
            })
        );
    }

    disconnectedCallback() {
        // Clear any pending timeouts when component is destroyed
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
    }
}