import { SEARCH_ICON } from "../Svg";
import { htmlToElement } from "../Utils";
import { strings } from "../Strings";

export function DataExplorer() {
  let obj = this;
  const searchIcon = htmlToElement(SEARCH_ICON);
  var container = document.createElement('div');
  var textBar = document.createElement('div');
  var queryTipsResultContainer = document.createElement('div');
  var queryTipsResultPlaceHolder = document.createElement('div');
  var chatBarInputIcon = document.createElement('div');

  var input = document.createElement('input');
  textBar.classList.add('autoql-vanilla-text-bar');
  textBar.classList.add('autoql-vanilla-text-bar-animation');
  textBar.classList.add('autoql-vanilla-text-bar-with-icon');
  chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
  container.classList.add('autoql-vanilla-querytips-container');
  queryTipsResultContainer.classList.add('autoql-vanilla-query-tips-result-container');
  queryTipsResultPlaceHolder.classList.add('query-tips-result-placeholder');
  queryTipsResultPlaceHolder.innerHTML = `
      <p>
          ${strings.exploreQueriesMessage1}
      <p>
      <p>
          ${strings.exploreQueriesMessage2}
      <p>
  `;
  
  queryTipsResultContainer.appendChild(queryTipsResultPlaceHolder);
  chatBarInputIcon.appendChild(searchIcon);
  textBar.appendChild(input);
  textBar.appendChild(chatBarInputIcon);
  container.appendChild(textBar);
  container.appendChild(queryTipsResultContainer);
  
  input.addEventListener('keydown', async event => {
      if (event.key == 'Enter' && input.value) {
          var chatBarLoadingSpinner = document.createElement('div');
          var searchVal = input.value.split(' ').join(',');
          var spinnerLoader = document.createElement('div');
          spinnerLoader.classList.add('autoql-vanilla-spinner-loader');
          chatBarLoadingSpinner.classList.add('chat-bar-loading-spinner');
          chatBarLoadingSpinner.appendChild(spinnerLoader);
          textBar.appendChild(chatBarLoadingSpinner);
          var options = obj.options;
          const URL = obj.getRelatedQueriesPath(1, searchVal, options);

          var response = await apiCallGet(URL, options);
          textBar.removeChild(chatBarLoadingSpinner);
          obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
      }
  });

  container.style.display = 'none';

  input.classList.add('autoql-vanilla-chata-input');
  input.classList.add('autoql-vanilla-explore-queries-input');
  input.classList.add('left-padding');
  input.setAttribute('placeholder', strings.exploreQueriesInput);

  obj.hide = () => {
    container.style.display = 'none';
  }

  obj.show = () => {
    container.style.display = 'block';
    input.focus();
  }

  obj.container = container;

}