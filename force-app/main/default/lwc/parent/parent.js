import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api displayValue = '';

    displayText = 'Initial Value - Parent Component';

    handleValueChange(event) {
        // Update local display value
        this.displayText = event.detail.value;
        
        // Forward the event to grandparent
        const valueChangeEvent = new CustomEvent('valuechange', {
            detail: { value: event.detail.value },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(valueChangeEvent);
    }
}