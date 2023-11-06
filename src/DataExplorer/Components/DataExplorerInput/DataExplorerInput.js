import tippy from 'tippy.js';
import { REQUEST_CANCELLED_ERROR, fetchDataExplorerAutocomplete, parseJwt } from 'autoql-fe-utils';
import { strings } from '../../../Strings';
import { SubjectName } from '../SubjectName/SubjectName';
import { htmlToElement } from '../../../Utils';
import { SEARCH_ICON, CLOSE_ICON } from '../../../Svg';

import './DataExplorerInput.scss';

const getRecentSelectionID = (options) => {
    const jwt = options?.authentication?.token;

    if (!jwt) {
        return;
    }

    try {
        const tokenInfo = parseJwt(jwt);
        const id = `data-explorer-recent-${tokenInfo.user_id}-${tokenInfo.project_id}`;
        return id;
    } catch (error) {
        console.error(error);
        return;
    }
};

const getRecentSearchesFromLocalStorage = (options) => {
    try {
        const id = getRecentSelectionID(options);

        if (!id) {
            return [];
        }

        const recentSearchesStr = localStorage.getItem(id);
        const recentSearchesArray = JSON.parse(recentSearchesStr);

        if (recentSearchesArray?.constructor !== Array || !recentSearchesArray?.length) {
            return [];
        }

        const filteredRecentSearchesArray = recentSearchesArray.filter((subject, i, self) => {
            return self.findIndex((subj) => subj.displayName == subject.displayName) === i;
        });

        if (filteredRecentSearchesArray?.length) {
            return filteredRecentSearchesArray;
        }
    } catch (error) {
        console.error(error);
    }

    return [];
};

const setRecentSearchesInLocalStorage = (recentSearches, options) => {
    try {
        const id = this.getRecentSelectionID(options);
        if (!id) {
            return;
        }

        const recentSearchesStr = JSON.stringify(recentSearches);
        localStorage.setItem(id, recentSearchesStr);
    } catch (error) {
        console.error(error);
    }
};

export function DataExplorerInput({ subjects, container, widget, onClearSearch, onSubjectClick }) {
    let obj = this;

    if (subjects) {
        obj.allSubjects = subjects.concat();
        obj.subjects = subjects.concat();
    }

    const options = widget.options;

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

    obj.applyMaxListHeight = () => {
        const bottomPadding = 200;
        const minHeight = 200;
        const maxHeight = container?.clientHeight - textBar?.clientHeight - bottomPadding;
        if (maxHeight > minHeight) {
            autocomplete.style.maxHeight = `${maxHeight}px`;
        }
    };

    obj.createAutocompleteSectionTitle = (title = '', action = '', onAction = () => {}) => {
        const titleContainer = document.createElement('li');
        const titleText = document.createElement('div');
        const titleAction = document.createElement('div');

        titleContainer.classList.add('autoql-vanilla-autocomplete-section-title');
        titleContainer.classList.add('autoql-vanilla-subject');
        titleText.classList.add('autoql-vanilla-autocomplete-section-title-text');
        titleAction.classList.add('autoql-vanilla-autocomplete-section-title-action');

        titleText.innerHTML = title;
        titleAction.innerHTML = action;
        titleAction.addEventListener('click', (e) => {
            e.stopPropagation();
            onAction(e);
        });

        titleContainer.appendChild(titleText);
        titleContainer.appendChild(titleAction);
        subjectsWrapper.appendChild(titleContainer);
    };

    obj.onClearHistory = () => {
        setRecentSearchesInLocalStorage([], options);
        obj.createSubjects();
    };

    obj.createSubjectListItem = (subject) => {
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
    };

    obj.createSubjects = () => {
        const subjects = obj.subjects;

        subjectsWrapper.innerHTML = '';

        // Create history list if it exists
        if (!input?.value) {
            const recentSearches = getRecentSearchesFromLocalStorage(options);
            const hasRecentSearches = !!recentSearches?.length;
            if (hasRecentSearches) {
                obj.createAutocompleteSectionTitle('Recent', 'Clear history', obj.onClearHistory);
                recentSearches.forEach((subject) => obj.createSubjectListItem(subject));
            }
        }

        // Create subject result list
        let titleText = 'Topics';
        if (input?.value) {
            titleText = `Related to "${input.value}"`;
        }

        obj.createAutocompleteSectionTitle(titleText);

        if (subjects?.length) {
            subjects.forEach((subject) => obj.createSubjectListItem(subject));
        } else {
            const noResultsMessage = document.createElement('li');
            noResultsMessage.classList.add('autoql-vanilla-data-explorer-search-no-results');
            noResultsMessage.classList.add('autoql-vanilla-subject');

            if (!subjects) {
                noResultsMessage.innerHTML = 'Loading Topics...';
            } else {
                noResultsMessage.innerHTML = 'No results';
            }

            subjectsWrapper.appendChild(noResultsMessage);
            return;
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
        if (!input.value) {
            chatBarClearIcon.classList.remove('autoql-vanilla-chat-bar-clear-icon-visible');
            obj.setSubjects(obj.allSubjects);
        } else {
            try {
                obj.setLoading();
                const result = await fetchDataExplorerAutocomplete({
                    ...(widget?.options?.authentication ?? {}),
                    suggestion: e.target.value,
                });

                obj.setSubjects(result, false);
            } catch (error) {
                if (error?.data?.message !== REQUEST_CANCELLED_ERROR) {
                    console.error(error);
                    obj.setSubjects([], false);
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
        // const textBarHeight = textBar.clientHeight;
        // const headerHeight = widget.header.clientHeight;
        // const margin = 60;
        // const height = container?.height ?? 0
        // autocomplete.style.maxHeight = height - (textBarHeight + headerHeight + margin) + 'px';
        obj.applyMaxListHeight();
        autocomplete.classList.add('autoql-vanilla-autocomplete-show');
    });

    obj.setSubjects = (subjects, allSubjects = true) => {
        if (!subjects) {
            return;
        }

        if (allSubjects) {
            obj.allSubjects = subjects.concat();
        }

        obj.subjects = subjects.concat();
        obj.createSubjects();
    };

    obj.createSubjects();

    return obj;
}
