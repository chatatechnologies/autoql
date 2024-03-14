import {
    getQueryValidationQueryText,
    initializeQueryValidationOptions,
    updateStartAndEndIndexes,
} from 'autoql-fe-utils';

import { RUN_QUERY, TRASH_ICON } from '../Svg';
import { strings } from '../Strings';
import { cloneObject, createIcon, uuidv4 } from '../Utils';
import { Select } from '../ChataComponents/Select/Select';

import './QueryValidationMessage.scss';

export function QueryValidationMessage({ response, onSubmit = () => {}, submitText, submitIcon }) {
    const container = document.createElement('div');
    container.classList.add('chata-response-content-container');

    try {
        const queryValidationOptions = initializeQueryValidationOptions({ responseBody: response?.data });

        if (!queryValidationOptions) {
            console.warn('Unable to create validation message - there was an error intializing the suggestion options');
            return container;
        }

        var selectedSuggestions = queryValidationOptions?.selections;
        const plainTextList = queryValidationOptions?.plainTextList;
        const suggestionLists = queryValidationOptions?.suggestionLists;

        if (!suggestionLists?.length || !selectedSuggestions?.length) {
            console.warn('Unable to create validation message - the suggestion lists were empty');
            return container;
        }

        const getRunQueryButton = () => {
            const runQueryButton = document.createElement('button');

            const icon = submitIcon ?? RUN_QUERY;
            const runQueryIcon = createIcon(submitIcon);
            const runQueryText = document.createElement('span');

            runQueryButton.classList.add('autoql-vanilla-chata-safety-net-execute-btn');
            runQueryIcon.classList.add('autoql-vanilla-chata-execute-query-icon');
            runQueryText.innerHTML = submitText ?? strings.runQuery;

            runQueryButton.appendChild(runQueryIcon);
            runQueryButton.appendChild(runQueryText);

            return runQueryButton;
        };

        const createValidationMessageContent = () => {
            const validationMessageContainer = document.createElement('div');
            const validationMessageText = document.createElement('div');
            const validationMessageContent = document.createElement('div');

            validationMessageContainer.classList.add('autoql-vanilla-query-validation-message-container');
            validationMessageContent.classList.add('autoql-vanilla-chata-safety-net-query');
            validationMessageText.classList.add('autoql-vanilla-chata-safety-net-description');
            validationMessageText.innerHTML = strings.safetynet;

            plainTextList.map((textValue, index) => {
                const chunk = document.createElement('span');

                if (textValue) {
                    const textElement = document.createElement('span');
                    textElement.innerHTML = textValue;
                    chunk.appendChild(textElement);
                }

                const suggestion = cloneObject(selectedSuggestions[index]);
                const suggestionList = suggestionLists[index]?.concat();

                if (suggestion && !suggestion.hidden) {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.classList.add('autoql-vanilla-validation-message-selector');

                    const options = suggestionList.map((sugg) => {
                        let suffix = sugg?.value_label ? ` (${sugg.value_label})` : ' (Original term)';

                        return {
                            value: sugg.id,
                            label: sugg.text,
                            listLabel: `${sugg.text}${suffix}`,
                            suggestion: sugg,
                        };
                    });

                    const removeTermOptionLabel = document.createElement('span');
                    const removeTermIcon = createIcon(TRASH_ICON);
                    removeTermOptionLabel.appendChild(removeTermIcon);
                    removeTermOptionLabel.append(document.createTextNode('Remove term'));

                    options.push({
                        value: 'remove-word',
                        label: removeTermOptionLabel,
                    });

                    const select = new Select({
                        options,
                        initialValue: suggestion.id,
                        outlined: false,
                        showArrow: false,
                        onChange: (clickedOption) => {
                            const clickedSuggestion = clickedOption.suggestion;

                            if (clickedOption?.value === 'remove-word') {
                                selectedSuggestions[index].hidden = true;
                                suggestionElement.style.display = 'none';
                            } else {
                                selectedSuggestions[index] = clickedSuggestion;
                            }

                            const newSelectedSuggestions = updateStartAndEndIndexes({
                                selectedSuggestions,
                                plainTextList,
                            });

                            selectedSuggestions = newSelectedSuggestions;
                        },
                    });

                    select.id = uuidv4();
                    select.classList.add('autoql-vanilla-query-validation-select');

                    suggestionElement.appendChild(select);
                    chunk.appendChild(suggestionElement);
                }

                validationMessageContent.appendChild(chunk);
            });

            const runQueryButton = getRunQueryButton();
            runQueryButton.onclick = () => {
                const query = getQueryValidationQueryText(selectedSuggestions, plainTextList);
                const userSelection = selectedSuggestions.filter((selection) => !selection.hidden);
                onSubmit({ query, userSelection });
            };

            validationMessageContainer.appendChild(validationMessageText);
            validationMessageContainer.appendChild(validationMessageContent);
            validationMessageContainer.appendChild(runQueryButton);

            container.appendChild(validationMessageContainer);
        };

        createValidationMessageContent();
    } catch (error) {
        console.error(error);
    }

    return container;
}
