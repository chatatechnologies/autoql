import datepicker from 'js-datepicker'
import { PopoverChartSelector } from '../Charts/PopoverChartSelector';

import './DatePicker.scss'
import 'js-datepicker/dist/datepicker.min.css'

export function DatePicker(e, options) {
    const popover = new PopoverChartSelector(e, 'bottom', 'start', 0);

    this.popover = popover

    this.show = this.popover.show
    this.close = this.popover.close

    this.createContent = () => {
        var datePickerContainer = document.createElement('div');
        datePickerContainer.classList.add('autoql-vanilla-date-picker-container');

        var datePickerHiddenInput = document.createElement('input');
        datePickerHiddenInput.classList.add('autoql-vanilla-date-picker-hidden-input');
        datePickerContainer.appendChild(datePickerHiddenInput);

        popover.appendContent(datePickerContainer);

        if (datePickerContainer.parentNode) {
            const datePicker = datepicker(datePickerHiddenInput, { ...options, alwaysShow: true, position: 'bl' })
            if (datePicker?.calendarContainer) {
                datePicker.calendarContainer.classList.add('autoql-vanilla-date-picker-calendar-container')
            }
            this.datePicker = datePicker
        }

        popover.show();
    };

    this.createContent();

    return this
}