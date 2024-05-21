import { PopoverChartSelector } from '../../NewCharts/PopoverChartSelector';
import { uuidv4 } from '../../Utils';
import { MonthRangePicker } from './MonthRangePicker';
import { YearRangePicker } from './YearRangePicker';
import { DayRangePicker } from './DayRangePicker';

import '../Radio/Radio.scss';
import '../Button/Button.scss';
import './DateRangePicker.scss';

export function DateRangePicker(
    e,
    {
        type = 'day',
        title,
        initialRange,
        onSelection = () => {},
        onSelectionApplied = () => {},
        validRange,
        showApplyBtn = true,
    } = {},
) {
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

    this.isOpen = () => {
        return this.popover.isOpen;
    };

    this.createContent = () => {
        var datePickerContainer = document.createElement('div');
        datePickerContainer.classList.add('autoql-vanilla-date-picker-container');
        datePickerContainer.id = `autoql-vanilla-date-picker-container-${ID}`;
        datePickerContainer.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        if (title) {
            const datePickerTitle = document.createElement('h3');
            datePickerTitle.innerHTML = title;
            datePickerContainer.appendChild(datePickerTitle);
        }

        popover.appendContent(datePickerContainer);

        let datePicker;

        const pickerParams = {
            minDate: validRange?.startDate,
            maxDate: validRange?.endDate,
            initialRange: this.selectedRange,
            onRangeSelection: (selectedRange) => {
                this.selectedRange = selectedRange;
                onSelection(selectedRange);
                if (!showApplyBtn) {
                    onSelectionApplied(selectedRange);
                }
            },
        };

        if (type.toLowerCase() === 'month') {
            datePicker = new MonthRangePicker(datePickerContainer, pickerParams);
        } else if (type.toLowerCase() === 'year') {
            datePicker = new YearRangePicker(datePickerContainer, pickerParams);
        } else {
            datePicker = new DayRangePicker(datePickerContainer, pickerParams);
        }

        this.datePicker = datePicker;

        if (showApplyBtn) {
            const applyBtn = document.createElement('button');
            applyBtn.innerHTML = 'Apply';
            applyBtn.classList.add('autoql-vanilla-btn');
            applyBtn.onclick = () => {
                onSelectionApplied(this.selectedRange);
                this.close();
            };

            datePickerContainer.appendChild(applyBtn);
        }

        this.show();
    };

    this.createContent();

    return this;
}
