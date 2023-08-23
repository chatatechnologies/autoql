import dayjs from '../../Utils/dayjsPlugins';
import { createIcon } from '../../Utils';
import { Select } from '../Select';
import { CARET_DOWN_ICON } from '../../Svg';

export function MonthPicker(
    component,
    {
        initialRange,
        minDate,
        maxDate,
        onRangeSelection = () => {},
    } = {},
) {
    const now = dayjs();

    let visibleYear = now.year();
    let selectedStart = now.startOf('month');
    let selectedEnd = now.endOf('month');

    if (initialRange) {
        selectedStart = dayjs(initialRange.startDate).startOf('month');
        selectedEnd = dayjs(initialRange.endDate).endOf('month');
        visibleYear = selectedEnd.year();
    } else if (minDate && maxDate && (now.isBefore(dayjs(minDate)) || now.isAfter(dayjs(maxDate)))) {
        selectedStart = dayjs(minDate).startOf('month');
        selectedEnd = dayjs(maxDate).endOf('month');
    }

    this.monthElements = {};
    this.selectedRange = initialRange;
    this.visibleYear = visibleYear;
    this.selectedStart = selectedStart;
    this.selectedEnd = selectedEnd;
    this.previewStart = undefined;
    this.previewEnd = undefined;
    this.focusedDateDisplay = 'start';

    this.sortFunction = (a, b) => {
        try {
            if (Number(a) < Number(b)) {
                return -1;
            }
            if (Number(a) > Number(b)) {
                return 1;
            }
            return 0;
        } catch (error) {
            console.error(error);
            return 0;
        }
    };

    this.isSelected = (timestamp) => {
        const isSelectedStart = timestamp.startOf('month').isSame(this.selectedStart?.startOf('month'));
        const isSelectedEnd =
            (isSelectedStart && !this.selectedEnd) || timestamp.endOf('month').isSame(this.selectedEnd?.endOf('month'));
        const isSelected = isSelectedStart || isSelectedEnd || this.selectedRangeIncludesMonth(timestamp);

        return {
            isSelected,
            isSelectedStart,
            isSelectedEnd,
        };
    };

    this.isPreview = (timestamp) => {
        const isPreviewStart = timestamp.startOf('month').isSame(this.previewStart);
        const isPreviewEnd = timestamp.endOf('month').isSame(this.previewEnd);
        const isPreview =
            isPreviewStart || isPreviewEnd || timestamp.isBetween(this.previewStart, this.previewEnd, 'month');

        return {
            isPreview,
            isPreviewStart,
            isPreviewEnd,
        };
    };

    this.isDisabled = (timestamp) => {
        const isBeforeMinDate = minDate && timestamp.isBefore(dayjs(minDate).startOf('month'));
        const isAfterMaxDate = maxDate && timestamp.isAfter(dayjs(maxDate).endOf('month'));
        return isBeforeMinDate || isAfterMaxDate;
    };

    this.selectedRangeIncludesMonth = (timestamp) => {
        if (this.selectedStart && this.selectedEnd) {
            return timestamp.isBetween(this.selectedStart, this.selectedEnd, 'month');
        }
        return false;
    };

    this.onMonthStartSelection = (timestamp) => {
        this.selectedStart = timestamp.startOf('month');
        this.selectedEnd = undefined;
        this.focusedDateDisplay = 'end';

        const rangeSelection = [this.selectedStart, timestamp];
        const selectedStartMonthStart = rangeSelection[0].startOf('month');
        const selectedEndMonthEnd = rangeSelection[1].endOf('month');

        onRangeSelection({
            startDate: selectedStartMonthStart.toDate(),
            endDate: selectedEndMonthEnd.toDate(),
        });
    };

    this.onMonthEndSelection = (timestamp) => {
        try {
            if (!this.selectedStart) {
                this.selectedEnd = timestamp;
                this.focusedDateDisplay = 'start';
            }

            const rangeSelection = [this.selectedStart, timestamp];
            if (this.selectedStart.isAfter(timestamp)) {
                rangeSelection.reverse();
            }

            const selectedStartMonthStart = rangeSelection[0].startOf('month');
            const selectedEndMonthEnd = rangeSelection[1].endOf('month');

            this.selectedStart = selectedStartMonthStart;
            this.selectedEnd = selectedEndMonthEnd;

            onRangeSelection({
                startDate: selectedStartMonthStart.toDate(),
                endDate: selectedEndMonthEnd.toDate(),
            });
        } catch (error) {
            console.error(error);
        }
    };

    this.handleMonthClick = (month) => {
        const timestamp = this.getTimestamp(month);
        if (this.focusedDateDisplay === 'start') {
            this.onMonthStartSelection(timestamp);
        } else {
            this.onMonthEndSelection(timestamp);
        }

        this.applyAllSelectedStyles();
    };

    this.clearPreviewStyles = () => {
        for (const month in this.monthElements) {
            this.monthElements[month].classList.remove('preview-start');
            this.monthElements[month].classList.remove('preview-end');
            this.monthElements[month].classList.remove('preview');
        }
    };

    this.applyAllStyles = () => {
        for (const month in this.monthElements) {
            const monthBtn = this.monthElements[month];
            const timestamp = this.getTimestamp(month);

            const isDisabled = this.isDisabled(timestamp);
            const isThisMonth = month === dayjs().month() && this.visibleYear == dayjs().year();

            if (isThisMonth) monthBtn.classList.add('current-month');
            else monthBtn.classList.remove('current-month');
            if (isDisabled) monthBtn.classList.add('autoql-vanilla-day-disabled');
            else monthBtn.classList.remove('autoql-vanilla-day-disabled');

            this.applyPreviewStyles(monthBtn);
            this.applySelectedStyles(monthBtn);
        }
    };

    this.applyAllPreviewStyles = () => {
        for (const month in this.monthElements) {
            this.applyPreviewStyles(this.monthElements[month]);
        }
    };

    this.applyAllSelectedStyles = () => {
        for (const month in this.monthElements) {
            this.applySelectedStyles(this.monthElements[month]);
        }
    };

    this.applyPreviewStyles = (monthBtn) => {
        const timestamp = this.getTimestamp(monthBtn.month);
        const { isPreview, isPreviewStart, isPreviewEnd } = this.isPreview(timestamp);

        if (isPreviewStart) monthBtn.classList.add('preview-start');
        else monthBtn.classList.remove('preview-start');
        if (isPreviewEnd) monthBtn.classList.add('preview-end');
        else monthBtn.classList.remove('preview-end');
        if (isPreview) monthBtn.classList.add('preview');
        else monthBtn.classList.remove('preview');
    };

    this.applySelectedStyles = (monthBtn) => {
        const timestamp = this.getTimestamp(monthBtn.month);
        const { isSelected, isSelectedStart, isSelectedEnd } = this.isSelected(timestamp);

        if (isSelectedStart) monthBtn.classList.add('selection-start');
        else monthBtn.classList.remove('selection-start');
        if (isSelectedEnd) monthBtn.classList.add('selection-end');
        else monthBtn.classList.remove('selection-end');
        if (isSelected) monthBtn.classList.add('active');
        else monthBtn.classList.remove('active');
    };

    this.handleMonthHover = (month) => {
        const timestamp = this.getTimestamp(month);

        if (this.isDisabled(timestamp)) {
            return;
        }

        let previewStart = timestamp.startOf('month');
        let previewEnd = timestamp.endOf('month');

        if (this.selectedStart && this.focusedDateDisplay === 'end') {
            if (previewEnd.isBefore(this.selectedStart)) {
                previewEnd = this.selectedStart.endOf('month');
            } else if (this.selectedStart.isBefore(previewStart)) {
                previewStart = this.selectedStart.startOf('month');
            }
        }

        this.previewStart = previewStart;
        this.previewEnd = previewEnd;

        this.applyAllPreviewStyles();
    };

    this.incrementYear = () => {
        this.visibleYear = Number(this.visibleYear) + 1;
        this.yearPickerSelect?.setValue(this.visibleYear);
        this.applyAllStyles();
    };

    this.decrementYear = () => {
        this.visibleYear = Number(this.visibleYear) - 1;
        this.yearPickerSelect?.setValue(this.visibleYear);
        this.applyAllStyles();
    };

    this.createDateDisplay = () => {
        const startDateText = this.selectedStart?.startOf('month').format('MMM YYYY') ?? '';
        const endDateText = this.selectedEnd?.startOf('month').format('MMM YYYY') ?? startDateText ?? '';

        const dateDisplayWrapper = document.createElement('div');
        dateDisplayWrapper.classList.add('autoql-vanilla-date-display-wrapper');

        const dateDisplayDiv = document.createElement('div');
        dateDisplayDiv.classList.add('autoql-vanilla-date-display');
        dateDisplayWrapper.appendChild(dateDisplayDiv);

        const dateDisplayStart = document.createElement('span');
        dateDisplayStart.classList.add('autoql-vanilla-date-picker-input');
        dateDisplayStart.classList.add('autoql-vanilla-date-display-item');
        if (this.focusedDateDisplay === 'start')
            dateDisplayStart.classList.add('autoql-vanilla-date-display-item-active');
        dateDisplayDiv.appendChild(dateDisplayStart);
        this.dateDisplayStart = dateDisplayStart;

        const dateDisplayStartInput = document.createElement('input');
        dateDisplayStartInput.setAttribute('readOnly', true);
        dateDisplayStartInput.setAttribute('placeholder', 'Early');
        dateDisplayStartInput.setAttribute('value', startDateText);
        dateDisplayStartInput.addEventListener('click', () => {
            this.focusedDateDisplay = 'start';
            this.dateDisplayStart.classList.add('autoql-vanilla-date-display-item-active');
            this.dateDisplayEnd.classList.remove('autoql-vanilla-date-display-item-active');
            // this.applyAllStyles();
        });
        dateDisplayStart.appendChild(dateDisplayStartInput);

        const dateDisplayEnd = document.createElement('span');
        dateDisplayEnd.classList.add('autoql-vanilla-date-picker-input');
        dateDisplayEnd.classList.add('autoql-vanilla-date-display-item');
        if (this.focusedDateDisplay === 'end') dateDisplayEnd.classList.add('autoql-vanilla-date-display-item-active');
        dateDisplayDiv.appendChild(dateDisplayEnd);
        this.dateDisplayEnd = dateDisplayEnd;

        const dateDisplayEndInput = document.createElement('input');
        dateDisplayEndInput.setAttribute('readOnly', true);
        dateDisplayEndInput.setAttribute('placeholder', 'Continuous');
        dateDisplayEndInput.setAttribute('value', endDateText);
        dateDisplayEndInput.addEventListener('click', () => {
            this.focusedDateDisplay = 'end';
            this.dateDisplayEnd.classList.add('autoql-vanilla-date-display-item-active');
            this.dateDisplayStart.classList.remove('autoql-vanilla-date-display-item-active');
            // this.applyAllStyles();
        });
        dateDisplayEnd.appendChild(dateDisplayEndInput);

        this.monthPicker?.appendChild(dateDisplayWrapper);
    };

    this.createYearPicker = () => {
        const lowerYearLimit = parseInt(minDate ? dayjs(minDate).year() : dayjs(new Date()).add(-100, 'year').year());
        const upperYearLimit = parseInt(maxDate ? dayjs(maxDate).year() : dayjs(new Date()).add(20, 'year').year());

        const yearPicker = document.createElement('div');
        yearPicker.classList.add('autoql-vanilla-month-picker-year');

        const yearPickerBackBtn = document.createElement('button');
        yearPickerBackBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerBackBtn.classList.add('autoql-vanilla-prev-btn');
        yearPickerBackBtn.disabled = this.visibleYear == lowerYearLimit;
        if (!yearPickerBackBtn.disabled) yearPickerBackBtn.onclick = this.decrementYear;
        yearPicker.appendChild(yearPickerBackBtn);

        const yearPickerBackBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerBackBtnIcon.style.transform = 'rotate(90deg)';
        yearPickerBackBtn.appendChild(yearPickerBackBtnIcon);

        const yearPickerSelect = new Select({
            initialValue: this.visibleYear,
            size: 'small',
            position: 'bottom',
            align: 'middle',
            onChange: (option) => {
                this.visibleYear = Number(option.value);
                this.applyAllStyles();
            },
            options: new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
                const year = val - i;
                return {
                    value: year,
                    label: year,
                };
            }),
            popoverClassName: 'autoql-vanilla-year-picker-popover',
        });
        yearPickerSelect.classList.add('year-picker');
        yearPicker.appendChild(yearPickerSelect);
        this.yearPickerSelect = yearPickerSelect;

        const yearPickerNextBtn = document.createElement('button');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-btn');
        yearPickerNextBtn.disabled = this.visibleYear == upperYearLimit;
        if (!yearPickerNextBtn.disabled) yearPickerNextBtn.onclick = this.incrementYear;
        yearPicker.appendChild(yearPickerNextBtn);

        const yearPickerNextBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerNextBtnIcon.style.transform = 'rotate(-90deg)';
        yearPickerNextBtn.appendChild(yearPickerNextBtnIcon);

        this.monthPicker.appendChild(yearPicker);
    };

    this.getTimestamp = (month) => {
        return dayjs(`${this.visibleYear}-${month + 1}-15`);
    };

    this.createMonthPicker = () => {
        const monthGrid = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [9, 10, 11],
        ];

        const monthPickerContent = document.createElement('div');
        monthPickerContent.classList.add('autoql-vanilla-month-picker');

        monthGrid.forEach((monthRow) => {
            const monthRowElement = document.createElement('div');
            monthRowElement.classList.add('month-picker-row');

            monthRow.forEach((month) => {
                const timestamp = this.getTimestamp(month);
                const monthName = dayjs(`2021-${month + 1}-15`).format('MMM');

                const monthBtn = document.createElement('div');
                monthBtn.classList.add('month-picker-month');
                monthBtn.month = month;

                const isDisabled = this.isDisabled(timestamp);
                const isThisMonth = month === dayjs().month() && this.visibleYear == dayjs().year();

                if (isThisMonth) monthBtn.classList.add('current-month');
                if (isDisabled) monthBtn.classList.add('autoql-vanilla-day-disabled');

                this.applyPreviewStyles(monthBtn);
                this.applySelectedStyles(monthBtn);

                monthBtn.addEventListener('click', () => this.handleMonthClick(month));
                monthBtn.addEventListener('mouseenter', () => this.handleMonthHover(month));
                monthBtn.addEventListener('mouseleave', () => {
                    this.clearPreviewStyles();
                    if (!isDisabled) {
                        this.previewStart = undefined;
                        this.previewEnd = undefined;
                    }
                });

                const monthTextWrapper = document.createElement('div');
                monthTextWrapper.classList.add('month-picker-month-text-wrapper');
                monthBtn.appendChild(monthTextWrapper);
                this.monthElements[month] = monthBtn;

                const monthTextDiv = document.createElement('div');
                monthTextDiv.classList.add('month-picker-month-text');
                monthTextWrapper.appendChild(monthTextDiv);

                const monthTextSpan = document.createElement('span');
                monthTextSpan.innerHTML = monthName;
                monthTextDiv.appendChild(monthTextSpan);

                monthRowElement.appendChild(monthBtn);
            });

            monthPickerContent.appendChild(monthRowElement);
        });

        this.monthPicker?.appendChild(monthPickerContent);
    };

    const monthPicker = document.createElement('div');
    monthPicker.classList.add('autoql-vanilla-date-picker');
    monthPicker.classList.add('autoql-vanilla-month-range-picker');

    this.monthPicker = monthPicker;

    this.createDateDisplay();
    this.createYearPicker();
    this.createMonthPicker();

    component?.appendChild(monthPicker);

    return this;
}
