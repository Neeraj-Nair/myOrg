import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    inputValue = '';
    displayValue = '';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleButtonClick() {
        // Update local display value
        this.displayValue = this.inputValue;
        
        // Dispatch custom event to parent
        const valueChangeEvent = new CustomEvent('valuechange', {
            detail: { value: this.inputValue },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(valueChangeEvent);
    }
}