import { SEARCH_ICON, DATA_EXPLORER_SEARCH_ICON } from "../Svg";
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

  textBar.classList.add('autoql-vanilla-text-bar');
  textBar.classList.add('autoql-vanilla-text-bar-animation');
  textBar.classList.add('autoql-vanilla-text-bar-with-icon');
  chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
  container.classList.add('autoql-vanilla-querytips-container');
  input.classList.add('autoql-vanilla-chata-input');
  input.classList.add('autoql-vanilla-explore-queries-input');
  input.classList.add('left-padding');
  introMessage.classList.add('autoql-vanilla-data-explorer-intro-message');
  input.setAttribute('placeholder', strings.exploreQueriesInput);
  title.appendChild(document.createTextNode('Welcome to '));
  title.appendChild(htmlToElement(DATA_EXPLORER_SEARCH_ICON));
  title.appendChild(document.createTextNode('Data Explorer'));
  
  chatBarInputIcon.appendChild(searchIcon);
  textBar.appendChild(input);
  textBar.appendChild(chatBarInputIcon);
  introMessage.appendChild(title);
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