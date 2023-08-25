import { uuidv4 } from '../../Utils';
import { Input } from '../Input';

import './Slider.scss';

export function Slider(options) {
    if (!options) {
        console.warn('No options provided to Slider component. Unable to render');
        return;
    }

    const {
        renderThumbNumber = true,
        initialValue,
        min = 0,
        max = 100,
        minLabel,
        maxLabel,
        marks = 10,
        debounce = false,
        throttle = true,
        debounceDelay = 20,
        throttleDelay = 20,
        showInput = false,
        label,
        step = 1,
        onChange = () => {},
    } = options;

    this.ID = uuidv4();
    this.value = initialValue;

    const slider = document.createElement('div');
    slider.classList.add('autoql-vanilla-range-slider-wrapper');

    // TODO - add mobile detection
    // if (isMobile) slider.classList.add('mobile')

    this.slider = slider;

    let minValue = min;
    let maxValue = max;
    let inputStep = undefined;

    if (!isNaN(step)) {
        inputStep = `${step}`;
    }

    if (isNaN(min)) {
        minValue = 0;
    }

    if (isNaN(max)) {
        maxValue = 100;
    }

    this.getValidatedValue = (value) => {
        const numberValue = Number(value);

        if (!isNaN(value) && numberValue >= min && numberValue <= max) {
            return value;
        }

        if (numberValue > max) {
            return max;
        }

        if (numberValue < min) {
            return min;
        }

        return this.value;
    };

    this.onInputChange = (e) => {
        const value = e.target.value;
        this.value = this.getValidatedValue(value);
        this.setSliderValue(this.value);

        console.log('on input change', value, this.sliderElement?.value);
    };

    this.onInputBlur = () => {
        if (this.input.value !== this.value) {
            this.setSliderValue(this.value);
            this.setInputValue(this.value);
        }
    };

    this.setInputValue = (value) => {
        this.input?.setValue?.(value);
    };

    this.setSliderValue = (value) => {
        this.sliderElement.value = `${value}`;
    };

    this.debouncedOnChange = (value) => {
        if (!debounce) {
            onChange(Number(value));
        } else {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                onChange(Number(value));
            }, debounceDelay);
        }
    };

    this.throttledOnChange = (value) => {
        if (!this.inThrottle) {
            onChange(Number(value));
            this.inThrottle = true;
            this.throttleTimer = setTimeout(() => (this.inThrottle = false), throttleDelay);
        }
    };

    this.onSliderChange = (e) => {
        const value = e.target.value;
        this.value = this.getValidatedValue(value);

        this.setInputValue(value);

        if (throttle) {
            this.throttledOnChange(value);
        } else if (debounce) {
            this.debouncedOnChange(value);
        } else {
            onChange(Number(value));
        }
    };

    const sliderAndLabelContainer = document.createElement('div');
    sliderAndLabelContainer.classList.add('autoql-vanilla-range-slider-and-label-container');
    slider.appendChild(sliderAndLabelContainer);

    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('autoql-vanilla-range-slider-container');
    sliderAndLabelContainer.appendChild(sliderContainer);

    const minMaxLabels = document.createElement('div');
    minMaxLabels.classList.add('autoql-vanilla-range-slider-min-max-labels');
    sliderContainer.appendChild(minMaxLabels);

    const sliderMarkLabelTextMin = document.createElement('div');
    sliderMarkLabelTextMin.classList.add('autoql-vanilla-range-slider-mark-label');
    sliderMarkLabelTextMin.innerHTML = minLabel ?? minValue;
    minMaxLabels.appendChild(sliderMarkLabelTextMin);

    const sliderMarkLabel = document.createElement('label');
    sliderMarkLabel.id = 'autoql-vanilla-range-slider-label';
    sliderMarkLabel.classList.add('autoql-vanilla-range-slider-label');
    if (label) sliderMarkLabel.innerHTML = label;
    minMaxLabels.appendChild(sliderMarkLabel);

    const sliderMarkLabelTextMax = document.createElement('div');
    sliderMarkLabelTextMax.classList.add('autoql-vanilla-range-slider-mark-label');
    sliderMarkLabelTextMax.innerHTML = maxLabel ?? maxValue;
    minMaxLabels.appendChild(sliderMarkLabelTextMax);

    this.createSlider = () => {
        const sliderElement = document.createElement('input');
        sliderElement.classList.add('autoql-vanilla-range-slider');
        sliderElement.setAttribute('type', 'range');
        if (min !== undefined) sliderElement.setAttribute('min', min);
        if (max !== undefined) sliderElement.setAttribute('max', max);
        if (step !== undefined) sliderElement.setAttribute('step', step);
        sliderElement.value = `${initialValue}`;
        sliderElement.oninput = this.onSliderChange;
        sliderContainer.appendChild(sliderElement);

        this.sliderElement = sliderElement;
    };

    this.createInput = () => {
        if (!showInput) {
            return;
        }

        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('autoql-vanilla-range-slider-input-wrapper');
        sliderAndLabelContainer.appendChild(inputWrapper);

        const input = new Input({
            type: 'number',
            value: initialValue,
            min: minValue,
            max: maxValue,
            step: inputStep,
            onBlur: this.onInputBlur,
            onChange: this.onInputChange,
        });
        this.input = input;

        inputWrapper.appendChild(input);
    };

    this.createSlider();
    this.createInput();

    return this.slider;
}
