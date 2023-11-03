import tippy from 'tippy.js';

import { strings } from '../../../Strings';
import { SubjectName } from '../SubjectName/SubjectName';
import { htmlToElement } from '../../../Utils';

import { SEARCH_ICON, CLOSE_ICON } from '../../../Svg';

import './DataExplorerInput.scss';
import { REQUEST_CANCELLED_ERROR, fetchDataExplorerAutocomplete } from 'autoql-fe-utils';

export function DataExplorerInput({ subjects, height, widget, onClearSearch, onSubjectClick }) {
    let obj = this;

    obj.subjects = subjects || [];

    obj.autocompleteResult;

    const searchIcon = htmlToElement(SEARCH_ICON);
    const clearIcon = htmlToElement(CLOSE_ICON);

    const input = document.createElement('input');
    const textBar = document.createElement('div');
    const chatBarInputIcon = document.createElement('div');
    const chatBarClearIcon = document.createElement('div');
    const autocomplete = document.createElement('div');
    const subjectsWrapper = document.createElement('ul');

    obj.textBar = textBar;

    textBar.classList.add('autoql-vanilla-text-bar');
    textBar.classList.add('autoql-vanilla-text-bar-animation');
    textBar.classList.add('autoql-vanilla-text-bar-with-icon');
    chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
    chatBarClearIcon.classList.add('autoql-vanilla-chat-bar-clear-icon');
    chatBarClearIcon.onclick = () => obj.clearSearch();
    const chatBarClearIconTooltip = tippy(chatBarClearIcon);
    chatBarClearIconTooltip.setContent(strings.clearSearch);
    chatBarClearIconTooltip.setProps({
        theme: 'chata-theme',
        delay: [500],
    });

    input.classList.add('autoql-vanilla-chata-input');
    input.classList.add('autoql-vanilla-explore-queries-input');
    input.classList.add('left-padding');
    autocomplete.classList.add('autoql-vanilla-data-explorer-autocomplete');
    input.setAttribute('placeholder', strings.dataExplorerInput);

    obj.clearLoading = () => {};
    obj.setLoading = () => {};

    obj.clearSearch = () => {
        chatBarClearIcon.classList.remove('autoql-vanilla-chat-bar-clear-icon-visible');

        if (input) {
            input.value = '';
        }

        onClearSearch?.();
    };

    obj.createSubjects = () => {
        const subjects = obj.autocompleteResult ?? obj.subjects;

        subjectsWrapper.innerHTML = '';

        if (subjects?.length) {
            subjects.forEach((subject) => {
                const li = document.createElement('li');
                li.classList.add('autoql-vanilla-subject');
                const subjectName = new SubjectName({ subject });
                li.appendChild(subjectName);
                subjectsWrapper.appendChild(li);
                li.onclick = () => {
                    chatBarClearIcon.classList.add('autoql-vanilla-chat-bar-clear-icon-visible');
                    autocomplete.classList.remove('autoql-vanilla-autocomplete-show');
                    input.value = subject.displayName;

                    onSubjectClick?.(subject);
                };
            });
        }
    };

    chatBarInputIcon.appendChild(searchIcon);
    chatBarClearIcon.appendChild(clearIcon);
    autocomplete.appendChild(subjectsWrapper);
    textBar.appendChild(input);
    textBar.appendChild(chatBarInputIcon);
    textBar.appendChild(autocomplete);
    textBar.appendChild(chatBarClearIcon);

    input.addEventListener('input', async (e) => {
        chatBarClearIcon.classList.add('autoql-vanilla-chat-bar-clear-icon-visible');
        if (input.value === '') {
            chatBarClearIcon.classList.remove('autoql-vanilla-chat-bar-clear-icon-visible');
            obj.setSubjects(obj.subjects);
        }

        if (input.value !== '') {
            try {
                obj.setLoading();
                const result = await fetchDataExplorerAutocomplete({
                    ...(widget?.options?.authentication ?? {}),
                    suggestion: e.target.value,
                });

                obj.setSubjects(result);
            } catch (error) {
                if (error?.data?.message !== REQUEST_CANCELLED_ERROR) {
                    console.error(error);
                    obj.setSubjects([]);
                }
            }

            obj.clearLoading();
        }
    });

    input.addEventListener('keydown', async (event) => {
        if (event.key == 'Enter' && input.value) {
            autocomplete.classList.remove('autoql-vanilla-autocomplete-show');

            // contentWrapper.innerHTML = '';
            // const relatedQueriesSection = new RelatedQueries({
            //     icon: CHATA_BUBBLES_ICON,
            //     title: `Query suggestions for "${input.value}"`,
            //     containerHeight: container.clientHeight,
            //     previewSectionHeight: 0,
            //     textBarHeight: textBar.clientHeight,
            //     plainText: input.value,
            //     widget,
            // });
            // contentWrapper.appendChild(relatedQueriesSection);
        }
    });

    input.addEventListener('focus', () => {
        const textBarHeight = textBar.clientHeight;
        const headerHeight = widget.header.clientHeight;
        const margin = 60;
        autocomplete.style.maxHeight = height - (textBarHeight + headerHeight + margin) + 'px';
        autocomplete.classList.add('autoql-vanilla-autocomplete-show');
    });

    obj.setSubjects = (subjects) => {
        obj.subjects = subjects;
        obj.createSubjects();
    };

    obj.createSubjects();

    return obj;
}
