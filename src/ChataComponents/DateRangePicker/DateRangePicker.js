import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';
import { uuidv4 } from '../../Utils';
import { MonthPicker } from './MonthPicker';

import '../Radio/Radio.scss';
import '../Button/Button.scss';
import './DateRangePicker.scss';
import { YearPicker } from './YearPicker';

export function DateRangePicker(e, { type, title, initialRange, onSelection = () => {}, onSelectionApplied = () => {}, validRange } = {}) {
    const popover = new PopoverChartSelector(e, 'bottom', 'start', 0);

    const ID = uuidv4();

    this.selectedRange = {
        startDate: initialRange?.startDate ?? validRange?.startDate ?? new Date(),
        endDate: initialRange?.endDate ?? validRange?.endDate ?? new Date(),
        key: 'selection',
    };

    this.popover = popover;
    this.show = this.popover.show;
    this.close = this.popover.close;

    this.createContent = () => {
        var datePickerContainer = document.createElement('div');
        datePickerContainer.classList.add('autoql-vanilla-date-picker-container');
        datePickerContainer.id = `autoql-vanilla-date-picker-container-${ID}`;

        const datePickerTitle = document.createElement('h3');
        datePickerTitle.innerHTML = title;
        datePickerContainer.appendChild(datePickerTitle);

        popover.appendContent(datePickerContainer);

        let datePicker;

        const pickerParams = {
            minDate: validRange?.startDate,
            maxDate: validRange?.endDate,
            initialRange: this.selectedRange,
            onRangeSelection: (selectedRange) => {
                this.selectedRange = selectedRange;
                onSelection(selectedRange);
            },
        }

        if (type.toLowerCase() === 'month') {
            datePicker = new MonthPicker(datePickerContainer, pickerParams);
        } else if (type.toLowerCase() === 'year') {
            datePicker = new YearPicker(datePickerContainer, pickerParams);
        } else {
            // Default calendar picker goes here
        }

        this.datePicker = datePicker;

        const applyBtn = document.createElement('button');
        applyBtn.innerHTML = 'Apply';
        applyBtn.classList.add('autoql-vanilla-btn');
        applyBtn.onclick = () => {
            onSelectionApplied(this.selectedRange);
            this.close();
        };

        datePickerContainer.appendChild(applyBtn);

        this.show();
    };

    this.createContent();

    return this;
}
