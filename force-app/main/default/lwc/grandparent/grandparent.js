import { LightningElement } from 'lwc';

export default class Grandparent extends LightningElement {
    displayValue = '';

    handleValueChange(event) {
        // Update display value when event is received from nested components
        this.displayValue = event.detail.value;
    }
}