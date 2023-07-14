import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { constructRTArray, fetchVLAutocomplete } from 'autoql-fe-utils';
import { htmlToElement } from '../Utils';
import { strings } from '../Strings';
import { INFO_ICON, FILTER_LOCKING } from '../Svg';

import './ReverseTranslation.scss';

dayjs.extend(utc);

export function ReverseTranslation(queryResponse, onValueLabelClick, textOnly = false) {
    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-reverse-translation-container');

    try {
    const interpretation = queryResponse?.data?.parsed_interpretation;
    const reverseTranslationArray = constructRTArray(interpretation);

    this.validateAndUpdateValueLabels = () => {
        if (reverseTranslationArray?.length) {
            const sessionFilters = queryResponse?.data?.fe_req?.persistent_filter_locks ?? [];
            const persistentFilters = queryResponse?.data?.fe_req?.session_filter_locks ?? [];
            const lockedFilters = [...persistentFilters, ...sessionFilters] ?? [];

            reverseTranslationArray.forEach((chunk, i) => {
                if (chunk.c_type === 'VALUE_LABEL') {
                    const lockedFilter = lockedFilters.find(
                        (filter) => filter?.value?.toLowerCase()?.trim() === chunk.eng.toLowerCase().trim(),
                    );
                    if (lockedFilter) {
                        chunk.lockedFilter = lockedFilter;
                    }
                }
            });
        }
    };

    this.getInfoIcon = () => {
        const iconContainer = document.createElement('span');
        iconContainer.classList.add('autoql-vanilla-reverse-translation-icon');
        iconContainer.setAttribute('data-tippy-content', strings.reverseTranslationTooltip)
        iconContainer.innerHTML = INFO_ICON;
        return iconContainer;
    };

    this.getLabel = () => {
        const label = document.createElement('strong');
        label.textContent = strings.reverseTranslationLabel;
        return label;
    };

    this.handleValueLabelClick = (e, chunk) => {
        e.stopPropagation();
        onValueLabelClick(chunk);
    };

    this.getInterpretationChunk = (chunk) => {
        const chunkSpan = document.createElement('span');

        switch (chunk.c_type) {
            case 'VALUE_LABEL': {
                if (onValueLabelClick && !textOnly) {
                    const VLLink = document.createElement('a');
                    VLLink.classList.add('autoql-vanilla-condition-link');
                    VLLink.onclick = (e) => this.handleValueLabelClick(e, chunk);

                    const VLLinkText = document.createElement('span');
                    VLLinkText.innerHTML = `&nbsp;${chunk.eng}`;
                    VLLink.appendChild(VLLinkText);

                    if (chunk.lockedFilter) {
                        const lockIcon = document.createElement('span');
                        lockIcon.style.display = 'inline-block';
                        lockIcon.setAttribute('data-tippy-content', strings.lockedValueLabel);
                        lockIcon.innerHTML = FILTER_LOCKING;
                        VLLink.appendChild(lockIcon);
                    }

                    chunkSpan.appendChild(VLLink);
                    return chunkSpan;
                }
            }
            // case 'DELIM': {
            //     chunkSpan.innerHTML += chunk.eng.trim();
            //     break;
            //   }
            case 'DELIM': {
                chunkSpan.innerHTML += chunk.eng;
                break;
            }
            // case 'TEXT': {
            //     chunkSpan.innerHTML += `&nbsp${chunk.eng}`;
            //     break
            // }
            default: {
                if (chunk.eng?.trim()) {
                    chunkSpan.innerHTML += `&nbsp;${chunk.eng.trim()}`;
                }
                break;
            }
        }

        return chunkSpan;
    };

    this.getReverseTranslationSpan = () => {
        const reverseTranslationSpan = document.createElement('span');
        reverseTranslationArray.forEach((chunk, i) => {
            const chunkSpan = this.getInterpretationChunk(chunk);
            reverseTranslationSpan.appendChild(chunkSpan);
        });
        return reverseTranslationSpan;
    };

        this.validateAndUpdateValueLabels();    
        container.appendChild(this.getInfoIcon());
        container.appendChild(this.getLabel());
        container.appendChild(this.getReverseTranslationSpan());
    } catch (error) {
        console.error(error)
    }

    return container;
}
