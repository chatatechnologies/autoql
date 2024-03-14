import tippy from 'tippy.js';

import {
    DataExplorerTypes,
    REQUEST_CANCELLED_ERROR,
    fetchDataExplorerAutocomplete,
    getRecentSearchesFromLocalStorage,
    setRecentSearchesInLocalStorage,
    addSubjectToRecentSearches,
} from 'autoql-fe-utils';

import { strings } from '../../../Strings';
import { htmlToElement } from '../../../Utils';
import { SEARCH_ICON, CLOSE_ICON } from '../../../Svg';
import { SubjectName } from '../SubjectName/SubjectName';

import './DataExplorerInput.scss';

export function DataExplorerInput({ subjects, container, options, onClearSearch, onSubmit }) {
    let obj = this;

    if (subjects) {
        obj.allSubjects = subjects.concat();
        obj.subjects = subjects.concat();
    }

    const auth = options?.authentication;

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

    obj.input = input;

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
        setRecentSearchesInLocalStorage([], auth);
        obj.createSubjects();
    };

    obj.onSearch = (subject, skipQueryValidation) => {
        addSubjectToRecentSearches(subject, auth);
        onSubmit?.(subject, skipQueryValidation);
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

            obj.onSearch(subject);
        };
    };

    obj.createSubjects = () => {
        const subjects = obj.subjects;

        subjectsWrapper.innerHTML = '';

        // Create history list if it exists
        const recentSearches = getRecentSearchesFromLocalStorage(auth);
        const hasRecentSearches = !!recentSearches?.length;
        if (hasRecentSearches) {
            obj.createAutocompleteSectionTitle(strings.recent, strings.clearHistory, obj.onClearHistory);
            recentSearches.forEach((subject) => obj.createSubjectListItem(subject));
        }

        // Create subject result list
        let titleText = strings.topics;
        if (input?.value) {
            titleText = `${strings.relatedTo} "${input.value}"`;
        }

        obj.createAutocompleteSectionTitle(titleText);

        if (subjects?.length) {
            subjects.forEach((subject) => obj.createSubjectListItem(subject));
        } else {
            const noResultsMessage = document.createElement('li');
            noResultsMessage.classList.add('autoql-vanilla-data-explorer-search-no-results');
            noResultsMessage.classList.add('autoql-vanilla-subject');

            if (!subjects) {
                noResultsMessage.innerHTML = `${strings.loadingTopics}...`;
            } else {
                noResultsMessage.innerHTML = strings.noResults;
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
                    ...(auth ?? {}),
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
            const text = input.value;

            let subject = obj.allSubjects.find(
                (subj) => subj?.displayName?.toLowerCase().trim() === text?.toLowerCase().trim(),
            );

            let skipQueryValidation = true;
            if (!subject) {
                skipQueryValidation = false;
                subject = {
                    type: DataExplorerTypes.TEXT_TYPE,
                    displayName: text,
                };
            }

            obj.onSearch(subject, skipQueryValidation);
        }
    });

    input.addEventListener('focus', () => {
        obj.createSubjects();
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
