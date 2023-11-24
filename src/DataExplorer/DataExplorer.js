import {
    SEARCH_ICON,
    DATA_EXPLORER_SEARCH_ICON,
    CHATA_BUBBLES_ICON,
    ABACUS_ICON,
    TABLE_ICON,
    BOOK_ICON,
    CLOSE_ICON,
} from '../Svg';
import tippy from 'tippy.js';
import { refreshTooltips } from '../Tooltips';
import { htmlToElement, createIcon } from '../Utils';
import { strings } from '../Strings';
import { DataPreview } from './Components/DataPreview';
import { RelatedQueries } from './Components/RelatedQueries';

import './DataExplorer.scss';

export function DataExplorer({ subjects, widget }) {
    let obj = this;
    obj.subjects = subjects || [];
    const searchIcon = htmlToElement(SEARCH_ICON);
    const clearIcon = htmlToElement(CLOSE_ICON);
    const container = document.createElement('div');
    const textBar = document.createElement('div');
    const input = document.createElement('input');
    const chatBarInputIcon = document.createElement('div');
    const chatBarClearIcon = document.createElement('div');
    const introMessage = document.createElement('div');
    const title = document.createElement('h2');
    const instructions = document.createElement('div');
    const p = document.createElement('p');
    const instructionList = document.createElement('div');
    const listWrapper = document.createElement('div');
    const autocomplete = document.createElement('div');
    const subjectsWrapper = document.createElement('ul');
    const contentWrapper = document.createElement('div');
    const headerHeight = widget.header.clientHeight;
    const texts = [
        { icon: TABLE_ICON, string: 'Preview available data in a snapshot' },
        { icon: ABACUS_ICON, string: 'Explore data structure and column types' },
        { icon: CHATA_BUBBLES_ICON, string: 'View a variety of query suggestions' },
    ];

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
    refreshTooltips();
    container.classList.add('autoql-vanilla-querytips-container');
    input.classList.add('autoql-vanilla-chata-input');
    input.classList.add('autoql-vanilla-explore-queries-input');
    input.classList.add('left-padding');
    autocomplete.classList.add('autoql-vanilla-data-explorer-autocomplete');
    introMessage.classList.add('autoql-vanilla-data-explorer-intro-message');
    instructionList.classList.add('autoql-vanilla-intro-message-list-container');
    input.setAttribute('placeholder', strings.dataExplorerInput);

    title.appendChild(document.createTextNode('Welcome to '));
    title.appendChild(createIcon(DATA_EXPLORER_SEARCH_ICON));
    title.appendChild(document.createTextNode('Data Explorer'));
    p.appendChild(
        document.createTextNode(`
  Explore your data and discover what you can ask AutoQL. Simply enter a term or topic above and:
  `),
    );

    texts.map((text) => {
        const icon = createIcon(text.icon);
        const elem = document.createElement('p');

        elem.appendChild(icon);
        elem.appendChild(document.createTextNode(text.string));
        listWrapper.appendChild(elem);
    });
    obj.clearSearch = () => {
        var previewSection = document.querySelector(
            '.autoql-vanilla-data-explorer-section.autoql-vanilla-data-preview-section',
        );
        var relatedQueriesSection = document.querySelector(
            '.autoql-vanilla-data-explorer-section.autoql-vanilla-query-suggestions-section',
        );
        chatBarClearIcon.classList.remove('autoql-vanilla-chat-bar-clear-icon-visible');
        if (previewSection) {
            previewSection.remove();
        }
        if (relatedQueriesSection) {
            relatedQueriesSection.remove();
        }
        if (input) {
            input.value = '';
        }
        contentWrapper.appendChild(introMessage);
    };
    obj.createSubjects = () => {
        obj.subjects?.forEach((subject) => {
            const li = document.createElement('li');
            li.classList.add('autoql-vanilla-subject');
            li.appendChild(createIcon(BOOK_ICON));
            li.appendChild(document.createTextNode(subject.displayName));
            subjectsWrapper.appendChild(li);
            li.onclick = async () => {
                chatBarClearIcon.classList.add('autoql-vanilla-chat-bar-clear-icon-visible');
                autocomplete.classList.remove('autoql-vanilla-autocomplete-show');
                input.value = subject.displayName;
                contentWrapper.innerHTML = '';
                const previewSection = new DataPreview({
                    icon: TABLE_ICON,
                    title: `Data Preview "${subject.query}"`,
                    subject,
                    widgetOptions: widget.options,
                });
                contentWrapper.appendChild(previewSection.container);

                const relatedQueriesSection = new RelatedQueries({
                    icon: CHATA_BUBBLES_ICON,
                    title: `Query suggestions for "${subject.displayName}"`,
                    containerHeight: container.clientHeight,
                    previewSectionHeight: previewSection.container.clientHeight,
                    textBarHeight: textBar.clientHeight,
                    subject,
                    widget,
                });
                contentWrapper.appendChild(relatedQueriesSection);
            };
        });
    };

    chatBarInputIcon.appendChild(searchIcon);
    chatBarClearIcon.appendChild(clearIcon);
    autocomplete.appendChild(subjectsWrapper);
    textBar.appendChild(input);
    textBar.appendChild(chatBarInputIcon);
    textBar.appendChild(autocomplete);
    textBar.appendChild(chatBarClearIcon);
    instructionList.appendChild(listWrapper);
    instructions.appendChild(p);
    instructions.appendChild(instructionList);
    introMessage.appendChild(title);
    introMessage.appendChild(instructions);
    contentWrapper.appendChild(introMessage);
    container.appendChild(textBar);
    container.appendChild(contentWrapper);
    container.style.display = 'none';
    input.addEventListener('input', () => {
        chatBarClearIcon.classList.add('autoql-vanilla-chat-bar-clear-icon-visible');
        if (input.value === '') {
            chatBarClearIcon.classList.remove('autoql-vanilla-chat-bar-clear-icon-visible');
        }
    });
    input.addEventListener('keydown', async (event) => {
        if (event.key == 'Enter' && input.value) {
            contentWrapper.innerHTML = '';
            autocomplete.classList.remove('autoql-vanilla-autocomplete-show');

            const relatedQueriesSection = new RelatedQueries({
                icon: CHATA_BUBBLES_ICON,
                title: `Query suggestions for "${input.value}"`,
                containerHeight: container.clientHeight,
                previewSectionHeight: 0,
                textBarHeight: textBar.clientHeight,
                plainText: input.value,
                widget,
            });

            contentWrapper.appendChild(relatedQueriesSection);
        }
    });

    input.addEventListener('focus', () => {
        const height = container.clientHeight;
        const textBarHeight = textBar.clientHeight;
        const headerHeight = widget.header.clientHeight;
        const margin = 60;
        autocomplete.style.maxHeight = height - (textBarHeight + headerHeight + margin) + 'px';
        autocomplete.classList.add('autoql-vanilla-autocomplete-show');
    });

    obj.hide = () => {
        container.style.display = 'none';
    };

    obj.show = () => {
        container.style.display = 'block';
    };

    obj.setSubjects = (subjects) => {
        obj.subjects = subjects;
        obj.createSubjects();
    };

    obj.createSubjects();

    obj.container = container;
}
