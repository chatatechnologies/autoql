import axios from 'axios';

import { fetchVLAutocomplete, REQUEST_CANCELLED_ERROR, getAuthentication, animateInputText } from 'autoql-fe-utils';

import { strings } from '../Strings';
import { htmlToElement } from '../Utils';

import './VLAutocompleteInput.scss';

export function VLAutocompleteInput({
    options,
    placeholder = '',
    initialValue,
    onChange = () => {},
    context,
    column,
    popover,
}) {
    const obj = this;

    var view = document.createElement('div');
    view.classList.add('autoql-vanilla-vl-autocomplete-input-wrapper');

    obj.autoCompleteArray = [];
    obj.MAX_SUGGESTIONS = 10;

    obj.fetchSuggestions = async ({ value }) => {
        try {
            // If already fetching autocomplete, cancel it
            if (obj.axiosSource) {
                obj.axiosSource.cancel(REQUEST_CANCELLED_ERROR);
            }

            obj.axiosSource = axios.CancelToken?.source();

            const response = await fetchVLAutocomplete({
                ...getAuthentication(options?.authentication),
                suggestion: value,
                context: context,
                filter: column,
                cancelToken: obj.axiosSource.token,
            });

            const body = response?.data?.data;

            const sortingArray = [];
            let suggestionsMatchArray = [];
            obj.autoCompleteArray = [];
            suggestionsMatchArray = [...body.matches];

            let numMatches = suggestionsMatchArray.length;
            if (numMatches > obj.MAX_SUGGESTIONS) {
                numMatches = obj.MAX_SUGGESTIONS;
            }

            for (let i = 0; i < numMatches; i++) {
                sortingArray.push(suggestionsMatchArray[i]);
            }

            sortingArray.sort((a, b) => {
                const aText = a.format_txt;
                const bText = b.format_txt;
                return aText.toUpperCase() < bText.toUpperCase() ? -1 : aText > bText ? 1 : 0;
            });

            for (let idx = 0; idx < sortingArray.length; idx++) {
                obj.autoCompleteArray.push(sortingArray[idx]);
            }

            if (!value) {
                obj.allSuggestions = obj.autoCompleteArray;
            }

            view.createSuggestions(obj.autoCompleteArray);
        } catch (error) {
            console.error(error);
            if (error?.data?.message !== REQUEST_CANCELLED_ERROR) {
                console.error(error);
            }
        }
    };

    obj.fetchAllSuggestions = () => {
        if (!obj.allSuggestions) {
            obj.fetchSuggestions({ value: '' });
        }
    };

    obj.onInputFocus = () => {
        view.input?.select?.();
        obj.fetchAllSuggestions();
    };

    var input = document.createElement('input');
    input.classList.add('autoql-vanilla-vl-autocomplete-input');
    input.setAttribute('placeholder', strings.filterLockingInputPlaceholder);
    input.onfocus = obj.onInputFocus();
    view.input = input;

    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.classList.add('autoql-vanilla-auto-complete-suggestions-list');

    const autoCompleteList = document.createElement('div');

    autocompleteContainer.appendChild(autoCompleteList);
    view.appendChild(input);
    view.appendChild(autocompleteContainer);

    view.autoCompleteTimer = undefined;

    view.createSuggestions = (suggestionList) => {
        const matches = suggestionList;

        autoCompleteList.innerHTML = '';

        if (matches.length === 0) {
            // view.close();
            autoCompleteList.appendChild(
                htmlToElement('<div class="filter-locking-no-suggestions-text"><em>No Results</em></span>'),
            );
            return;
        }

        // autoCompleteList.style.display = 'block';

        matches.map((match) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('autoql-vanilla-filter-lock-suggestion-item');

            const displayName = match.format_txt ?? match.keyword;

            let displayNameType = '';
            if (match.show_message) {
                displayNameType = `(${match.show_message})`;
            }

            const content = htmlToElement(`<span><strong>${displayName}</strong> <em>${displayNameType}</em></span>`);

            suggestionItem.appendChild(content);
            autoCompleteList.appendChild(suggestionItem);

            content.onclick = async () => {
                // view.close();
                view.clear();
                onChange(match);
            };
        });

        popover?.setPosition();
    };

    // view.close = () => {
    //     autoCompleteList.innerHTML = '';
    //     autoCompleteList.style.display = 'none';
    // };

    view.clear = () => {
        input.value = '';
    };

    view.animateInputWithText = (text) => {
        animateInputText({
            text,
            inputRef: input,
            totalAnimationTime: 500,
            callback: () => obj.fetchSuggestions({ value: text }),
        });
    };

    input.onkeyup = (evt) => {
        if (evt.target.value) {
            obj.fetchSuggestions({ value: evt.target.value });
        } else if (obj.allSuggestions) {
            view.createSuggestions(obj.allSuggestions);
        }
    };

    return view;
}
