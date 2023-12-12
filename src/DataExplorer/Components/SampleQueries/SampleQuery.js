import { SampleQueryReplacementTypes, getQueryRequestParams, getTitleCase } from 'autoql-fe-utils';
import { VLAutocompleteInputPopover } from '../../../VLAutocomplete/VLAutocompletePopover';
import { createIcon } from '../../../Utils';
import { QUERY_SEND_BTN } from '../../../Svg';
import { InlineInputEditor } from '../../../InlineInputEditor/InlineInputEditor';

export function SampleQuery({ suggestion, options, context, onSubmit = () => {} }) {
    const renderedChunks = [];
    const values = suggestion.initialValues ?? {};

    const onValueChange = ({ vl, value, chunk }) => {
        let newValue;

        if (vl) {
            if (!vl.format_txt) {
                return;
            }

            newValue = vl?.format_txt;
            chunk.replacement = vl;
        } else if (value !== undefined) {
            newValue = value;
            if (chunk.replacement) {
                chunk.replacement.format_txt = value;
                chunk.replacement.keyword = value;
            }
        }

        chunk.value = newValue;

        const chunkName = chunk.name;

        if (!values?.[chunkName]) {
            return;
        }

        values[chunkName] = {
            ...values[chunkName],
            value: newValue,
            replacement: chunk.replacement,
        };
    };

    if (suggestion.chunked?.length) {
        suggestion.chunked.forEach((chunk, i) => {
            if (chunk?.value) {
                let text = chunk.value;
                if (i === 0 && chunk?.type == SampleQueryReplacementTypes.SAMPLE_QUERY_TEXT_TYPE) {
                    text = getTitleCase(chunk.value);
                }

                let chunkContent = text;

                if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_VL_TYPE) {
                    try {
                        const columnName = chunk.replacement?.display_name;
                        const renderedChunk = new VLAutocompleteInputPopover({
                            options,
                            context,
                            column: columnName,
                            initialValue: chunk.replacement,
                            placeholder: columnName ? `Search a "${columnName}"` : 'Search values',
                            onChange: (vl) => onValueChange({ vl, chunk }),
                        });
                        renderedChunks.push(renderedChunk);
                        return;
                    } catch (error) {
                        console.error(error);
                    }
                } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_AMOUNT_TYPE) {
                    try {
                        const renderedChunk = new InlineInputEditor({
                            options,
                            initialValue: chunk.value,
                            type: 'number',
                            onChange: (value) => onValueChange({ value, chunk }),
                        });
                        renderedChunks.push(renderedChunk);
                        return;
                    } catch (error) {
                        console.error(error);
                    }
                } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_TIME_TYPE) {
                    try {
                        const renderedChunk = new InlineInputEditor({
                            options,
                            initialValue: chunk.value,
                            type: 'text',
                            onChange: (value) => onValueChange({ value, chunk }),
                            datePicker: true,
                        });
                        renderedChunks.push(renderedChunk);
                        return;
                    } catch (error) {
                        console.error(error);
                    }
                }

                const chunkElement = document.createElement('div');
                chunkElement.classList.add('autoql-vanilla-data-explorer-sample-chunk');

                if (typeof chunkContent === 'string') {
                    chunkElement.innerHTML = chunkContent;
                } else if (chunkContent) {
                    chunkElement.appendChild(chunkContent);
                }

                renderedChunks.push(chunkElement);
            }
        });
    }

    const item = document.createElement('div');
    item.classList.add('autoql-vanilla-data-explorer-sample-query');

    const itemText = document.createElement('div');
    itemText.classList.add('autoql-vanilla-query-suggestion-text');

    renderedChunks.forEach((chunk) => {
        itemText.appendChild(chunk);
    });

    const sendButton = document.createElement('div');
    const sendIcon = createIcon(QUERY_SEND_BTN);
    sendButton.appendChild(sendIcon);
    sendButton.classList.add('autoql-vanilla-query-suggestion-send-btn');
    sendButton.setAttribute('data-tippy-content', 'Submit Query');
    sendButton.onclick = () => {
        const queryParams = getQueryRequestParams(suggestion, values);
        onSubmit(queryParams);
    };

    item.appendChild(itemText);
    item.appendChild(sendButton);

    return item;
}
