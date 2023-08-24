import dayjs from '../../Utils/dayjsPlugins';
import { createIcon } from '../../Utils';
import { Select } from '../Select';
import { CARET_DOWN_ICON } from '../../Svg';

const getDecade = (year) => {
    const yearsSinceDecadeStart = year % 10;
    const decadeStart = year - yearsSinceDecadeStart;
    return [decadeStart, decadeStart + 9];
};

export function YearRangePicker(component, { initialRange, minDate, maxDate, onRangeSelection = () => {} } = {}) {
    const now = dayjs();

    let visibleDecade = getDecade(now.year());
    let selectedStart = now.startOf('year');
    let selectedEnd = now.endOf('year');

    if (initialRange) {
        selectedStart = dayjs(initialRange.startDate).startOf('year');
        selectedEnd = dayjs(initialRange.endDate).endOf('year');
        visibleDecade = getDecade(selectedEnd.year());
    } else if (minDate && maxDate && (now.isBefore(dayjs(minDate)) || now.isAfter(dayjs(maxDate)))) {
        selectedStart = dayjs(minDate).startOf('year');
        selectedEnd = dayjs(maxDate).endOf('year');
    }

    this.selectedRange = initialRange;
    this.visibleDecade = visibleDecade;
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
        const isSelectedStart = timestamp.startOf('year').isSame(this.selectedStart?.startOf('year'));
        const isSelectedEnd =
            (isSelectedStart && !this.selectedEnd) || timestamp.endOf('year').isSame(this.selectedEnd?.endOf('year'));
        const isSelected = isSelectedStart || isSelectedEnd || this.selectedRangeIncludesYear(timestamp);

        return {
            isSelected,
            isSelectedStart,
            isSelectedEnd,
        };
    };

    this.isPreview = (timestamp) => {
        const isPreviewStart = timestamp.startOf('year').isSame(this.previewStart);
        const isPreviewEnd = timestamp.endOf('year').isSame(this.previewEnd);
        const isPreview =
            isPreviewStart || isPreviewEnd || timestamp.isBetween(this.previewStart, this.previewEnd, 'year');

        return {
            isPreview,
            isPreviewStart,
            isPreviewEnd,
        };
    };

    this.isDisabled = (timestamp) => {
        const isBeforeMinDate = minDate && timestamp.isBefore(dayjs(minDate).startOf('year'));
        const isAfterMaxDate = maxDate && timestamp.isAfter(dayjs(maxDate).endOf('year'));
        return isBeforeMinDate || isAfterMaxDate;
    };

    this.isInDecade = (year, decade) => {
        return year >= decade[0] && year <= decade[1];
    };

    this.selectedRangeIncludesYear = (timestamp) => {
        if (this.selectedStart && this.selectedEnd) {
            return timestamp.isBetween(this.selectedStart, this.selectedEnd, 'year');
        }
        return false;
    };

    this.onYearStartSelection = (timestamp) => {
        this.selectedStart = timestamp.startOf('year');
        this.selectedEnd = undefined;
        this.focusedDateDisplay = 'end';

        const rangeSelection = [this.selectedStart, timestamp];
        const selectedStartYearStart = rangeSelection[0].startOf('year');
        const selectedEndYearEnd = rangeSelection[1].endOf('year');

        onRangeSelection({
            startDate: selectedStartYearStart.toDate(),
            endDate: selectedEndYearEnd.toDate(),
        });
    };

    this.onYearEndSelection = (timestamp) => {
        try {
            if (!this.selectedStart) {
                this.selectedEnd = timestamp;
                this.focusedDateDisplay = 'start';
            }

            const rangeSelection = [this.selectedStart, timestamp];
            if (this.selectedStart.isAfter(timestamp)) {
                rangeSelection.reverse();
            }

            const selectedStartYearStart = rangeSelection[0].startOf('year');
            const selectedEndYearEnd = rangeSelection[1].endOf('year');

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

    this.handleYearClick = (year) => {
        const timestamp = this.getTimestamp(year);
        if (this.focusedDateDisplay === 'start') {
            this.onYearStartSelection(timestamp);
        } else {
            this.onYearEndSelection(timestamp);
        }

        this.applyAllSelectedStyles();
    };

    this.clearPreviewStyles = () => {
        for (const year in this.yearElements) {
            const yearBtn = this.yearElements[year];
            yearBtn.classList.remove('preview-start');
            yearBtn.classList.remove('preview-end');
            yearBtn.classList.remove('preview');
        }
    };

    this.applyAllPreviewStyles = () => {
        for (const year in this.yearElements) {
            this.applyPreviewStyles(this.yearElements[year]);
        }
    };

    this.applyAllSelectedStyles = () => {
        for (const year in this.yearElements) {
            this.applySelectedStyles(this.yearElements[year]);
        }
    };

    this.applyPreviewStyles = (yearBtn) => {
        const timestamp = this.getTimestamp(yearBtn.year);
        const { isPreview, isPreviewStart, isPreviewEnd } = this.isPreview(timestamp);

        if (isPreviewStart) yearBtn.classList.add('preview-start');
        else yearBtn.classList.remove('preview-start');
        if (isPreviewEnd) yearBtn.classList.add('preview-end');
        else yearBtn.classList.remove('preview-end');
        if (isPreview) yearBtn.classList.add('preview');
        else yearBtn.classList.remove('preview');
    };

    this.applySelectedStyles = (yearBtn) => {
        const timestamp = this.getTimestamp(yearBtn.year);
        const { isSelected, isSelectedStart, isSelectedEnd } = this.isSelected(timestamp);

        if (isSelectedStart) yearBtn.classList.add('selection-start');
        else yearBtn.classList.remove('selection-start');
        if (isSelectedEnd) yearBtn.classList.add('selection-end');
        else yearBtn.classList.remove('selection-end');
        if (isSelected) yearBtn.classList.add('active');
        else yearBtn.classList.remove('active');
    };

    this.handleYearHover = (year) => {
        const timestamp = this.getTimestamp(year);

        if (this.isDisabled(timestamp)) {
            return;
        }

        let previewStart = timestamp.startOf('year');
        let previewEnd = timestamp.endOf('year');

        if (this.selectedStart && this.focusedDateDisplay === 'end') {
            if (previewEnd.isBefore(this.selectedStart)) {
                previewEnd = this.selectedStart.endOf('year');
            } else if (this.selectedStart.isBefore(previewStart)) {
                previewStart = this.selectedStart.startOf('year');
            }
        }

        this.previewStart = previewStart;
        this.previewEnd = previewEnd;

        this.applyAllPreviewStyles();
    };

    this.incrementDecade = () => {
        const currentDecadeEnd = this.visibleDecade[1];
        this.visibleDecade = [currentDecadeEnd + 1, currentDecadeEnd + 10];
        this.createYearPicker();
    };

    this.decrementDecade = () => {
        const currentDecadeStart = this.visibleDecade[0];
        this.visibleDecade = [currentDecadeStart - 10, currentDecadeStart - 1];
        this.createYearPicker();
    };

    this.createDateDisplay = () => {
        const startDateText = this.selectedStart?.year() ?? '';
        const endDateText = this.selectedEnd?.year() ?? startDateText ?? '';

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
        });
        dateDisplayEnd.appendChild(dateDisplayEndInput);

        this.yearPicker?.appendChild(dateDisplayWrapper);
    };

    this.createDecadePicker = () => {
        const lowerDecadeLimit = minDate
            ? getDecade(dayjs(minDate).year())
            : getDecade(dayjs(new Date()).add(-100, 'year').year());

        const upperDecadeLimit = maxDate
            ? getDecade(dayjs(maxDate).year())
            : getDecade(dayjs(new Date()).add(20, 'year').year());

        const numDecades = (upperDecadeLimit[0] - lowerDecadeLimit[0]) / 10;

        const yearPicker = document.createElement('div');
        yearPicker.classList.add('autoql-vanilla-year-picker-decade');

        const yearPickerBackBtn = document.createElement('button');
        yearPickerBackBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerBackBtn.classList.add('autoql-vanilla-prev-btn');
        yearPickerBackBtn.disabled = this.visibleDecade[0] === lowerDecadeLimit[0];
        if (!yearPickerBackBtn.disabled) yearPickerBackBtn.onclick = this.decrementDecade;
        yearPicker.appendChild(yearPickerBackBtn);

        const yearPickerBackBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerBackBtnIcon.style.transform = 'rotate(90deg)';
        yearPickerBackBtn.appendChild(yearPickerBackBtnIcon);

        const yearPickerSelect = new Select({
            initialValue: `${this.visibleDecade[0]} - ${this.visibleDecade[1]}`,
            size: 'small',
            position: 'bottom',
            align: 'middle',
            onChange: (option) => {
                const decadeArray = option.value.split(' - ').map((year) => Number(year))
                this.visibleDecade = decadeArray;
                this.createYearPicker();
            },
            options: new Array(numDecades).fill(lowerDecadeLimit).map((decade, i) => {
                const decadeText = `${decade[0] + i * 10} - ${decade[1] + i * 10}`;
                return {
                    value: decadeText,
                    label: decadeText,
                };
            }),
            popoverClassName: 'autoql-vanilla-decade-picker-popover',
        });
        yearPickerSelect.classList.add('year-picker');
        yearPicker.appendChild(yearPickerSelect);
        this.yearPickerSelect = yearPickerSelect;

        const yearPickerNextBtn = document.createElement('button');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-prev-btn');
        yearPickerNextBtn.classList.add('autoql-vanilla-next-btn');
        yearPickerNextBtn.disabled = this.visibleDecade[0] === upperDecadeLimit[0];
        if (!yearPickerNextBtn.disabled) yearPickerNextBtn.onclick = this.incrementDecade;
        yearPicker.appendChild(yearPickerNextBtn);

        const yearPickerNextBtnIcon = createIcon(CARET_DOWN_ICON);
        yearPickerNextBtnIcon.style.transform = 'rotate(-90deg)';
        yearPickerNextBtn.appendChild(yearPickerNextBtnIcon);

        this.yearPicker.appendChild(yearPicker);
    };

    this.getTimestamp = (year) => {
        return dayjs(`${year}-01-15`);
    };

    this.createYearPicker = () => {
        this.yearElements = {}

        if (this.yearPickerContent) {
            this.yearPickerContent.parentElement.removeChild(this.yearPickerContent)
        }

        const yearArray = new Array(10).fill(this.visibleDecade[0]).map((val, i) => {
            return val + i;
        });

        const yearGrid = [
            [...yearArray.slice(0, 3)],
            [...yearArray.slice(3, 6)],
            [...yearArray.slice(6, 9)],
            [yearArray[9]],
        ];

        const yearPickerContent = document.createElement('div');
        yearPickerContent.classList.add('autoql-vanilla-year-picker');
        this.yearPickerContent = yearPickerContent;

        yearGrid.forEach((yearRow) => {
            const yearRowElement = document.createElement('div');
            yearRowElement.classList.add('year-picker-row');

            yearRow.forEach((year) => {
                const timestamp = this.getTimestamp(year);

                const yearBtn = document.createElement('div');
                yearBtn.classList.add('year-picker-year');
                yearBtn.year = year;

                const isDisabled = this.isDisabled(timestamp);
                const isThisYear = year === dayjs().year();

                if (isThisYear) yearBtn.classList.add('current-year');
                if (isDisabled) yearBtn.classList.add('autoql-vanilla-day-disabled');

                this.applyPreviewStyles(yearBtn);
                this.applySelectedStyles(yearBtn);

                yearBtn.addEventListener('click', () => this.handleYearClick(year));
                yearBtn.addEventListener('mouseenter', () => this.handleYearHover(year));
                yearBtn.addEventListener('mouseleave', () => {
                    this.clearPreviewStyles();
                    if (!isDisabled) {
                        this.previewStart = undefined;
                        this.previewEnd = undefined;
                    }
                });

                const yearTextWrapper = document.createElement('div');
                yearTextWrapper.classList.add('year-picker-year-text-wrapper');
                yearBtn.appendChild(yearTextWrapper);
                this.yearElements[year] = yearBtn;

                const yearTextDiv = document.createElement('div');
                yearTextDiv.classList.add('year-picker-year-text');
                yearTextWrapper.appendChild(yearTextDiv);

                const yearTextSpan = document.createElement('span');
                yearTextSpan.innerHTML = year;
                yearTextDiv.appendChild(yearTextSpan);

                yearRowElement.appendChild(yearBtn);
            });

            yearPickerContent.appendChild(yearRowElement);
        });

        this.yearPicker?.appendChild(yearPickerContent);
    };

    const yearPicker = document.createElement('div');
    yearPicker.classList.add('autoql-vanilla-date-picker');
    yearPicker.classList.add('autoql-vanilla-year-range-picker');

    this.yearPicker = yearPicker;

    this.createDateDisplay();
    this.createDecadePicker();
    this.createYearPicker();

    component?.appendChild(yearPicker);

    return this;
}
