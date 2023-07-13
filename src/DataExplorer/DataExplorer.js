import {
  SEARCH_ICON,
  DATA_EXPLORER_SEARCH_ICON,
  CHATA_BUBBLES_ICON,
  ABACUS_ICON,
  TABLE_ICON,
  BOOK_ICON,
} from "../Svg";
import { htmlToElement, createIcon } from "../Utils";
import { strings } from "../Strings";
import './DataExplorer.scss';
import { DataPreview } from "./Components/DataPreview";
import { RelatedQueries } from "./Components/RelatedQueries";

export function DataExplorer({ subjects, widget }) {
  let obj = this;
  obj.subjects = subjects;
  const searchIcon = htmlToElement(SEARCH_ICON);
  const container = document.createElement('div');
  const textBar = document.createElement('div');
  const input = document.createElement('input');
  const chatBarInputIcon  = document.createElement('div');
  const introMessage = document.createElement('div');
  const title = document.createElement('h2');
  const instructions = document.createElement('div');
  const p = document.createElement('p');
  const instructionList = document.createElement('div');
  const listWrapper = document.createElement('div');
  const autocomplete = document.createElement('div');
  const subjectsWrapper = document.createElement('ul'); 
  const contentWrapper = document.createElement('div');

  const texts = [
    { icon: TABLE_ICON, string: 'Preview available data in a snapshot' },
    { icon: ABACUS_ICON, string: 'Explore data structure and column types' },
    { icon: CHATA_BUBBLES_ICON, string: 'View a variety of query suggestions' },
  ];

  textBar.classList.add('autoql-vanilla-text-bar');
  textBar.classList.add('autoql-vanilla-text-bar-animation');
  textBar.classList.add('autoql-vanilla-text-bar-with-icon');
  chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
  container.classList.add('autoql-vanilla-querytips-container');
  input.classList.add('autoql-vanilla-chata-input');
  input.classList.add('autoql-vanilla-explore-queries-input');
  input.classList.add('left-padding');
  autocomplete.classList.add('autoql-vanilla-data-explorer-autocomplete');
  introMessage.classList.add('autoql-vanilla-data-explorer-intro-message');
  instructionList.classList.add('autoql-vanilla-intro-message-list-container');
  input.setAttribute('placeholder', strings.exploreQueriesInput);

  title.appendChild(document.createTextNode('Welcome to '));
  title.appendChild(createIcon(DATA_EXPLORER_SEARCH_ICON));
  title.appendChild(document.createTextNode('Data Explorer'));
  p.appendChild(document.createTextNode(`
    Explore your data and discover what you can ask AutoQL. Simply enter a term or topic above and:
  `));

  texts.map((text) => {
    const icon = createIcon(text.icon);
    const elem = document.createElement('p');

    elem.appendChild(icon);
    elem.appendChild(document.createTextNode(text.string));
    listWrapper.appendChild(elem);
  })

  obj.subjects.forEach((subject) => {
    const li = document.createElement('li');
    li.classList.add('autoql-vanilla-subject');
    li.appendChild(createIcon(BOOK_ICON));
    li.appendChild(document.createTextNode(subject.display_name));
    subjectsWrapper.appendChild(li);
    li.onclick = async () => {
      console.log('test');
      autocomplete.classList.remove('show')
      input.value = subject.display_name;
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
        title: `Query suggestions for "${subject.display_name}"`,
        containerHeight: container.clientHeight,
        previewSectionHeight: previewSection.container.clientHeight,
        subject,
        widget,
      });
      contentWrapper.appendChild(relatedQueriesSection);
    }
  })

  chatBarInputIcon.appendChild(searchIcon);
  autocomplete.appendChild(subjectsWrapper);
  textBar.appendChild(input);
  textBar.appendChild(chatBarInputIcon);
  textBar.appendChild(autocomplete);
  instructionList.appendChild(listWrapper);
  instructions.appendChild(p);
  instructions.appendChild(instructionList);
  introMessage.appendChild(title);
  introMessage.appendChild(instructions);
  contentWrapper.appendChild(introMessage);
  container.appendChild(textBar);
  container.appendChild(contentWrapper);
  container.style.display = 'none';
  
  input.addEventListener('keydown', async event => {
      if (event.key == 'Enter' && input.value) {
        container.removeChild(introMessage);
      }
  });

  input.addEventListener("focus", () => {
    autocomplete.classList.add('show');
  });
  
  input.addEventListener("blur", () => {
    setTimeout(() => autocomplete.classList.remove('show'), 100);
  });

  obj.hide = () => {
    container.style.display = 'none';
  }

  obj.show = () => {
    container.style.display = 'block';
  }
  
  obj.setSubjects = (subjects) => {
    obj.subjects = subjects;
  }

  obj.container = container;
}