import {
  SEARCH_ICON,
  DATA_EXPLORER_SEARCH_ICON,
  CHATA_BUBBLES_ICON,
  ABACUS_ICON,
  TABLE_ICON,
} from "../Svg";
import { htmlToElement } from "../Utils";
import { strings } from "../Strings";

export function DataExplorer() {
  let obj = this;
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
  introMessage.classList.add('autoql-vanilla-data-explorer-intro-message');
  instructionList.classList.add('autoql-vanilla-intro-message-list-container');
  input.setAttribute('placeholder', strings.exploreQueriesInput);

  title.appendChild(document.createTextNode('Welcome to '));
  title.appendChild(htmlToElement(DATA_EXPLORER_SEARCH_ICON));
  title.appendChild(document.createTextNode('Data Explorer'));
  p.appendChild(document.createTextNode(`
    Explore your data and discover what you can ask AutoQL. Simply enter a term or topic above and:
  `));

  texts.map((text) => {
    const icon = document.createElement('span');
    const elem = document.createElement('p');

    icon.innerHTML = text.icon;
    elem.appendChild(icon);
    elem.appendChild(document.createTextNode(text.string));
    listWrapper.appendChild(elem);
  })

  chatBarInputIcon.appendChild(searchIcon);
  textBar.appendChild(input);
  textBar.appendChild(chatBarInputIcon);
  instructionList.appendChild(listWrapper);
  instructions.appendChild(p);
  instructions.appendChild(instructionList);
  introMessage.appendChild(title);
  introMessage.appendChild(instructions);
  container.appendChild(textBar);
  container.appendChild(introMessage);
  container.style.display = 'none';
  
  input.addEventListener('keydown', async event => {
      if (event.key == 'Enter' && input.value) {
        
      }
  });

  obj.hide = () => {
    container.style.display = 'none';
  }

  obj.show = () => {
    container.style.display = 'block';
    input.focus();
  }

  obj.container = container;
}