import dayjs from '../../Utils/dayjsPlugins';
import { createIcon } from '../../Utils';
import { Select } from '../Select';
import { CARET_DOWN_ICON } from '../../Svg';
import { MONTH_NAMES, WEEKDAY_NAMES_SUN } from 'autoql-fe-utils';

export function DayRangePicker(component, { initialRange, minDate, maxDate, onRangeSelection = () => {} } = {}) {
    const now = dayjs();

    let visibleYear = now.year();
    let visibleMonth = now.month() + 1; // Months are 0 indexed in dayjs so we need to add 1
    let selectedStart = now.startOf('day');
    let selectedEnd = now.endOf('day');

    if (initialRange) {
        selectedStart = dayjs(initialRange.startDate).startOf('day');
        selectedEnd = dayjs(initialRange.endDate).endOf('day');
        visibleMonth = dayjs(initialRange.endDate).month() + 1;
        visibleYear = selectedEnd.year();
    } else if (minDate && maxDate && (now.isBefore(dayjs(minDate)) || now.isAfter(dayjs(maxDate)))) {
        selectedStart = dayjs(minDate).startOf('day');
        selectedEnd = dayjs(maxDate).endOf('day');
    }

    this.selectedRange = initialRange;
    this.visibleMonth = visibleMonth; // Number value, 1 indexed
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
        const isSelectedStart = timestamp.startOf('day').isSame(this.selectedStart?.startOf('day'));
        const isSelectedEnd =
            (isSelectedStart && !this.selectedEnd) || timestamp.endOf('day').isSame(this.selectedEnd?.endOf('day'));
        const isSelected = isSelectedStart || isSelectedEnd || this.selectedRangeIncludesDay(timestamp);

        return {
            isSelected,
            isSelectedStart,
            isSelectedEnd,
        };
    };

    this.isPreview = (timestamp) => {
        const isPreviewStart = timestamp.startOf('day').isSame(this.previewStart);
        const isPreviewEnd = timestamp.endOf('day').isSame(this.previewEnd);
        const isPreview =
            isPreviewStart || isPreviewEnd || timestamp.isBetween(this.previewStart, this.previewEnd, 'day');

        return {
            isPreview,
            isPreviewStart,
            isPreviewEnd,
        };
    };

    this.isDisabled = (timestamp) => {
        const isBeforeMinDate = minDate && timestamp.isBefore(dayjs(minDate).startOf('day'));
        const isAfterMaxDate = maxDate && timestamp.isAfter(dayjs(maxDate).endOf('day'));
        return isBeforeMinDate || isAfterMaxDate;
    };

    this.selectedRangeIncludesDay = (timestamp) => {
        if (this.selectedStart && this.selectedEnd) {
            return timestamp.isBetween(this.selectedStart, this.selectedEnd, 'day');
        }
        return false;
    };

    this.setFocusedDateDisplay = (value) => {
        this.focusedDateDisplay = value;

        if (value === 'start') {
            this.dateDisplayStart.classList.add('autoql-vanilla-date-display-item-active');
            this.dateDisplayEnd.classList.remove('autoql-vanilla-date-display-item-active');
        } else if (value === 'end') {
            this.dateDisplayEnd.classList.add('autoql-vanilla-date-display-item-active');
            this.dateDisplayStart.classList.remove('autoql-vanilla-date-display-item-active');
        }
    };

    this.onDayStartSelection = (timestamp) => {
        this.selectedStart = timestamp.startOf('day');
        this.selectedEnd = undefined;

        this.setFocusedDateDisplay('end');

        const rangeSelection = [this.selectedStart, timestamp];
        const selectedStartDayStart = rangeSelection[0].startOf('day');
        const selectedEndDayEnd = rangeSelection[1].endOf('day');

        onRangeSelection({
            startDate: selectedStartDayStart.toDate(),
            endDate: selectedEndDayEnd.toDate(),
        });
    };

    this.onDayEndSelection = (timestamp) => {
        try {
            if (!this.selectedStart) {
                this.selectedStart = timestamp;
            }

            this.selectedEnd = timestamp;
            this.setFocusedDateDisplay('start');

            const rangeSelection = [this.selectedStart, timestamp];
            if (this.selectedStart.isAfter(timestamp)) {
                rangeSelection.reverse();
            }

            const selectedStartYearStart = rangeSelection[0].startOf('day');
            const selectedEndYearEnd = rangeSelection[1].endOf('day');

            this.selectedStart = selectedStartYearStart;
            this.selectedEnd = selectedEndYearEnd;

            onRangeSelection({
                startDate: selectedStartYearStart.toDate(),
                endDate: selectedEndYearEnd.toDate(),
            });
        } catch (error) {
            console.error(error);
        }
    };

    this.handleDayClick = (timestamp) => {
        if (this.focusedDateDisplay === 'start') {
            this.onDayStartSelection(timestamp);
        } else {
            this.onDayEndSelection(timestamp);
        }

        this.applyAllSelectedStyles();
    };

    this.clearPreviewStyles = () => {
        for (const timestampSeconds in this.dayElements) {
            const dayBtn = this.dayElements[timestampSeconds];
            dayBtn?.classList.remove('preview-start');
            dayBtn?.classList.remove('preview-end');
            dayBtn?.classList.remove('preview');
        }
    };

    this.applyAllPreviewStyles = () => {
        for (const timestampSeconds in this.dayElements) {
            this.applyPreviewStyles(this.dayElements[timestampSeconds]);
        }
    };

    this.applyAllSelectedStyles = () => {
        for (const timestampSeconds in this.dayElements) {
            this.applySelectedStyles(this.dayElements[timestampSeconds]);
        }
    };

    this.applyPreviewStyles = (dayBtn) => {
        if (!dayBtn) {
            return;
        }

        const { isPreview, isPreviewStart, isPreviewEnd } = this.isPreview(dayBtn.timestamp);

        if (isPreviewStart) dayBtn.classList.add('preview-start');
        else dayBtn.classList.remove('preview-start');
        if (isPreviewEnd) dayBtn.classList.add('preview-end');
        else dayBtn.classList.remove('preview-end');
        if (isPreview) dayBtn.classList.add('preview');
        else dayBtn.classList.remove('preview');
    };

    this.applySelectedStyles = (dayBtn) => {
        if (!dayBtn) {
            return;
        }

        const { isSelected, isSelectedStart, isSelectedEnd } = this.isSelected(dayBtn.timestamp);

        if (isSelectedStart) dayBtn.classList.add('selection-start');
        else dayBtn.classList.remove('selection-start');
        if (isSelectedEnd) dayBtn.classList.add('selection-end');
        else dayBtn.classList.remove('selection-end');
        if (isSelected) dayBtn.classList.add('active');
        else dayBtn.classList.remove('active');
    };

    this.handleDayHover = (timestamp) => {
        if (this.isDisabled(timestamp)) {
            return;
        }

        let previewStart = timestamp.startOf('day');
        let previewEnd = timestamp.endOf('day');

        if (this.selectedStart && this.focusedDateDisplay === 'end') {
            if (previewEnd.isBefore(this.selectedStart)) {
                previewEnd = this.selectedStart.endOf('day');
            } else if (this.selectedStart.isBefore(previewStart)) {
                previewStart = this.selectedStart.startOf('day');
            }
        }

        this.previewStart = previewStart;
        this.previewEnd = previewEnd;

        this.applyAllPreviewStyles();
    };

    this.incrementMonth = () => {
        if (this.visibleMonth === 12) {
            this.incrementYear();
            this.visibleMonth = 1;
        } else {
            this.visibleMonth += 1;
        }

        this.monthPickerSelect?.setValue(this.visibleMonth);

        this.createDayPicker();
    };

    this.decrementMonth = () => {
        if (this.visibleMonth === 1) {
            this.decrementYear();
            this.visibleMonth = 12;
        } else {
            this.visibleMonth -= 1;
        }

        this.monthPickerSelect?.setValue(this.visibleMonth);

        this.createDayPicker();
    };

    this.incrementYear = () => {
        this.visibleYear = Number(this.visibleYear) + 1;
        this.yearPickerSelect?.setValue(this.visibleYear);
    };

    this.decrementYear = () => {
        this.visibleYear = Number(this.visibleYear) - 1;
        this.yearPickerSelect?.setValue(this.visibleYear);
    };

    this.createDateDisplay = () => {
        const startDateText = this.selectedStart?.format('ll');
        const endDateText = this.selectedEnd ? this.selectedEnd.format('ll') : startDateText ?? '';

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
            this.setFocusedDateDisplay('start');
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
            this.setFocusedDateDisplay('end');
        });
        dateDisplayEnd.appendChild(dateDisplayEndInput);

        this.dayPicker?.appendChild(dateDisplayWrapper);
    };

    this.createMonthSelect = (lowerYearLimit, upperYearLimit) => {
        const monthPickerSelect = new Select({
            initialValue: this.visibleMonth,
            size: 'small',
            position: 'bottom',
            align: 'middle',
            onChange: (option) => {
                this.visibleMonth = option.value;
                this.createDayPicker();
            },
            options: MONTH_NAMES.map((month, i) => ({
                value: i + 1,
                label: month,
            })),
            popoverClassName: 'autoql-vanilla-year-picker-popover',
        });

        monthPickerSelect.classList.add('year-picker');

        return monthPickerSelect;
    };

    this.createYearSelect = (lowerYearLimit, upperYearLimit) => {
        const yearPickerSelect = new Select({
            initialValue: this.visibleYear,
            size: 'small',
            position: 'bottom',
            align: 'middle',
            onChange: (option) => {
                this.visibleYear = Number(option.value);
                this.createDayPicker();
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

        return yearPickerSelect;
    };

    this.createMonthYearPickers = () => {
        const lowerYearLimit = parseInt(minDate ? dayjs(minDate).year() : now.add(-100, 'year').year());
        const upperYearLimit = parseInt(maxDate ? dayjs(maxDate).year() : now.add(20, 'year').year());

        const lowerMonthLimit = parseInt(minDate ? dayjs(minDate).month() + 1 : 1);
        const upperMonthLimit = parseInt(maxDate ? dayjs(maxDate).month() + 1 : 12);

        const yearPicker = document.createElement('div');
        yearPicker.classList.add('autoql-vanilla-month-picker-year');

        const yearPickerBackBtn = document.createElement('button');
        yearPickerBackBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerBackBtn.classList.add('autoql-vanilla-prev-btn');
        yearPickerBackBtn.disabled = this.visibleYear == lowerYearLimit && this.visibleMonth == lowerMonthLimit;
        if (!yearPickerBackBtn.disabled) yearPickerBackBtn.onclick = this.decrementMonth;
        yearPicker.appendChild(yearPickerBackBtn);

        const yearPickerBackBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerBackBtnIcon.style.transform = 'rotate(90deg)';
        yearPickerBackBtn.appendChild(yearPickerBackBtnIcon);

        const monthYearPickers = document.createElement('div');
        yearPicker.appendChild(monthYearPickers);

        const monthPickerSelect = this.createMonthSelect();
        monthYearPickers.appendChild(monthPickerSelect);
        this.monthPickerSelect = monthPickerSelect;

        const yearPickerSelect = this.createYearSelect(lowerYearLimit, upperYearLimit);
        monthYearPickers.appendChild(yearPickerSelect);
        this.yearPickerSelect = yearPickerSelect;

        const yearPickerNextBtn = document.createElement('button');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-btn');
        yearPickerNextBtn.disabled = this.visibleYear == upperYearLimit && this.visibleMonth == upperMonthLimit;
        if (!yearPickerNextBtn.disabled) yearPickerNextBtn.onclick = this.incrementMonth;
        yearPicker.appendChild(yearPickerNextBtn);

        const yearPickerNextBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerNextBtnIcon.style.transform = 'rotate(-90deg)';
        yearPickerNextBtn.appendChild(yearPickerNextBtnIcon);

        this.dayPicker.appendChild(yearPicker);
    };

    this.createDayPicker = () => {
        this.dayElements = {};

        if (this.dayPickerContent) {
            this.dayPickerContent.parentElement.removeChild(this.dayPickerContent);
            this.dayPickerContent = undefined;
        }

        // Use middle of the month to represent the whole month - Avoids confusion between time zones
        const monthMiddleTimestamp = dayjs(`${this.visibleYear}-${this.visibleMonth}-15`);

        const daysInMonth = monthMiddleTimestamp.daysInMonth();

        const dayArray = new Array(daysInMonth).fill(1).map((val, i) => {
            const day = val + i;
            const dateDayJS = dayjs(`${this.visibleYear}-${this.visibleMonth}-${day}`);
            return dateDayJS;
        });

        const monthStart = monthMiddleTimestamp.startOf('month');
        const monthStartDayOfWeek = monthStart.day();

        const dayGrid = [];

        if (monthStartDayOfWeek !== 0) {
            const daysBefore = monthStartDayOfWeek;
            dayGrid.push(
                new Array(daysBefore)
                    .fill(1)
                    .map((val, i) => {
                        return monthStart.subtract(val + i, 'day');
                    })
                    .reverse(),
            );
        }

        let weekNumber = 0;
        let dayOfWeek = monthStartDayOfWeek;

        dayArray.forEach((data) => {
            if (!dayGrid[weekNumber]) {
                dayGrid[weekNumber] = [];
            }

            dayGrid[weekNumber][dayOfWeek] = data;

            if (dayOfWeek === 6) {
                dayOfWeek = 0;
                weekNumber += 1;
            } else {
                dayOfWeek += 1;
            }
        });

        const monthEnd = monthMiddleTimestamp.endOf('month');
        const monthEndDayOfWeek = monthEnd.day();

        if (monthEndDayOfWeek !== 6) {
            const daysAfter = 6 - monthEndDayOfWeek;
            const nextDays = new Array(daysAfter).fill(1).map((val, i) => {
                return monthEnd.add(val + i, 'day');
            });

            dayGrid[weekNumber] = [...dayGrid[weekNumber], ...nextDays];
        }

        const dayPickerContent = document.createElement('div');
        dayPickerContent.classList.add('autoql-vanilla-year-picker');
        this.dayPickerContent = dayPickerContent;

        const weekdayLabels = document.createElement('div');
        weekdayLabels.classList.add('autoql-vanilla-weekday-labels');
        const weekdayLetters = WEEKDAY_NAMES_SUN.map((weekday) => weekday.substring(0, 3));
        weekdayLetters.forEach((weekdayLetter) => {
            const weekdayLabel = document.createElement('span');
            weekdayLabel.classList.add('autoql-vanilla-weekday-label');
            weekdayLabel.innerHTML = weekdayLetter;
            weekdayLabels.appendChild(weekdayLabel);
        });
        dayPickerContent.appendChild(weekdayLabels);

        dayGrid.forEach((dayRow) => {
            const dayRowElement = document.createElement('div');
            dayRowElement.classList.add('year-picker-row');

            dayRow.forEach((dateDayJS) => {
                const timestampSeconds = dateDayJS.valueOf();

                const dayBtn = document.createElement('div');
                dayBtn.classList.add('year-picker-year');
                dayBtn.timestamp = dateDayJS;

                const isDisabled = this.isDisabled(dateDayJS);
                const isToday = dateDayJS.isToday();

                if (isToday) dayBtn.classList.add('current-year');
                if (isDisabled) dayBtn.classList.add('autoql-vanilla-day-disabled');

                this.applyPreviewStyles(dayBtn);
                this.applySelectedStyles(dayBtn);

                dayBtn.addEventListener('click', () => this.handleDayClick(dateDayJS));
                dayBtn.addEventListener('mouseenter', () => this.handleDayHover(dateDayJS));
                dayBtn.addEventListener('mouseleave', () => {
                    this.clearPreviewStyles();
                    if (!isDisabled) {
                        this.previewStart = undefined;
                        this.previewEnd = undefined;
                    }
                });

                const dayTextWrapper = document.createElement('div');
                dayTextWrapper.classList.add('day-picker-day-text-wrapper');
                dayBtn.appendChild(dayTextWrapper);

                this.dayElements[timestampSeconds] = dayBtn;

                const dayTextDiv = document.createElement('div');
                dayTextDiv.classList.add('year-picker-year-text');

                const isVisibleMonth = dateDayJS.month() + 1 === this.visibleMonth;
                if (!isVisibleMonth) dayTextDiv.classList.add('inactive');
                dayTextWrapper.appendChild(dayTextDiv);

                const dayTextSpan = document.createElement('span');
                dayTextSpan.innerHTML = dateDayJS.date();
                dayTextDiv.appendChild(dayTextSpan);

                dayRowElement.appendChild(dayBtn);
            });

            dayPickerContent.appendChild(dayRowElement);
        });

        this.applyAllSelectedStyles();

        this.dayPicker?.appendChild(dayPickerContent);
    };

    const dayPicker = document.createElement('div');
    dayPicker.classList.add('autoql-vanilla-date-picker');
    dayPicker.classList.add('autoql-vanilla-year-range-picker');

    this.dayPicker = dayPicker;

    this.createDateDisplay();
    this.createMonthYearPickers();
    this.createDayPicker();

    component?.appendChild(dayPicker);

    return this;
}
