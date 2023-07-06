import { SEARCH_ICON } from "../Svg";
import { htmlToElement } from "../Utils";
import { strings } from "../Strings";

export function DataExplorer() {
  let obj = this;
  const searchIcon = htmlToElement(SEARCH_ICON);
  var container = document.createElement('div');
  var textBar = document.createElement('div');
  var input = document.createElement('input');
  var chatBarInputIcon  = document.createElement('div');

  textBar.classList.add('autoql-vanilla-text-bar');
  textBar.classList.add('autoql-vanilla-text-bar-animation');
  textBar.classList.add('autoql-vanilla-text-bar-with-icon');
  chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
  container.classList.add('autoql-vanilla-querytips-container');
  input.classList.add('autoql-vanilla-chata-input');
  input.classList.add('autoql-vanilla-explore-queries-input');
  input.classList.add('left-padding');
  input.setAttribute('placeholder', strings.exploreQueriesInput);

  chatBarInputIcon.appendChild(searchIcon);
  textBar.appendChild(input);
  textBar.appendChild(chatBarInputIcon);
  container.appendChild(textBar);
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