import { SampleQueryReplacementTypes, getQueryRequestParams, getTitleCase } from 'autoql-fe-utils';
import { VLAutocompleteInputPopover } from '../../../VLAutocomplete/VLAutocompletePopover';
import { createIcon } from '../../../Utils';
import { QUERY_SEND_BTN } from '../../../Svg';

export function SampleQuery({ suggestion, options, context, onSubmit = () => {} }) {
    const renderedChunks = [];
    const values = suggestion.initialValues ?? {};

    const onValueChange = (vl, chunk) => {
        if (vl) {
            chunk.replacement = vl;
            chunk.value = vl?.format_txt;
        }

        const chunkName = chunk.name;

        if (!values?.[chunkName] || !vl?.format_txt) {
            return;
        }

        values[chunkName] = {
            ...values[chunkName],
            value: vl.format_txt,
            replacement: vl,
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
                            onChange: (vl) => onValueChange(vl, chunk),
                        });
                        renderedChunks.push(renderedChunk);
                        return;
                    } catch (error) {
                        console.error(error);
                    }
                } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_AMOUNT_TYPE) {
                    chunkContent = text;
                    // chunkContent = (
                    //   <InlineInputEditor
                    //     value={chunk.value}
                    //     type='number'
                    //     onChange={(newValue) => this.onAmountChange(newValue, chunk.name)}
                    //     tooltipID={this.props.tooltipID}
                    //   />
                    // )
                } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_TIME_TYPE) {
                    chunkContent = text;
                    // TODO: console.log('CREATE INLINE INPUT EDITOR')
                    // chunkContent = (
                    //   <InlineInputEditor
                    //     value={chunk.value}
                    //     type='text'
                    //     onChange={(newValue) => this.onAmountChange(newValue, chunk.name)}
                    //     datePicker={true}
                    //     tooltipID={this.props.tooltipID}
                    //   />
                    // )
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
