import { PopoverChartSelector } from '../Charts/PopoverChartSelector';
import { VLAutocompleteInput } from './VLAutocompleteInput';
import './VLAutocompleteInput.scss';

export function VLAutocompleteInputPopover({
    options,
    initialValue,
    onChange = () => {},
    context,
    column,
    placeholder = 'Search & select a filter',
    position = 'bottom',
    align = 'start',
    popoverClassName,
}) {
    const obj = this;

    obj.selectedVL = initialValue;

    const inputPopoverBtn = document.createElement('div');
    inputPopoverBtn.classList.add('autoql-vanilla-autcomplete-input-popover-btn');
    inputPopoverBtn.innerHTML = initialValue?.format_txt ?? 'Select a Value';

    obj.setSelectedVL = (vl) => {
        obj.selectedVL = vl;
        inputPopoverBtn.innerHTML = vl?.format_txt;
        obj.popover.close();
        onChange(vl);
    };

    obj.showPopover = () => {
        obj.popover.show();
        obj.autocompleteInput?.input?.focus();
    };

    obj.createPopoverContent = () => {
        var popoverContainer = document.createElement('div');
        var popoverContent = document.createElement('div');

        popoverContainer.classList.add('autoql-vanilla-vlautocomplete-popover-container');
        popoverContent.classList.add('autoql-vanilla-autocomplete-input-popup-container');

        obj.popoverContainer = popoverContainer;

        obj.autocompleteInput = new VLAutocompleteInput({
            options,
            context,
            column,
            placeholder,
            initialValue,
            popover: obj.popover,
            onChange: (match) => obj.setSelectedVL(match),
        });

        if (obj.autocompleteInput) {
            popoverContent.appendChild(obj.autocompleteInput);
            popoverContainer.appendChild(popoverContent);

            return popoverContainer;
        }
    };

    inputPopoverBtn.addEventListener('click', (e) => {
        if (!obj.popover) {
            obj.popover = new PopoverChartSelector(
                e,
                position,
                align,
                0,
                'autoql-vanilla-autocomplete-input-popover-container',
                150,
            );
            obj.popover.classList.add('autoql-vanilla-vlautocomplete-popover-container');
            if (popoverClassName) obj.popover.classList.add(popoverClassName);

            const popoverContent = obj.createPopoverContent();

            obj.popover.appendContent(popoverContent);

            obj.showPopover();
        } else if (obj.popover.style.visibility === 'hidden') {
            obj.showPopover();
        } else {
            obj.popover.close();
        }
    });

    return inputPopoverBtn;
}
