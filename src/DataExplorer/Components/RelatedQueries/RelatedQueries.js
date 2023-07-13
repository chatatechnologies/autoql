import { Card } from "../Card";
import './RelatedQueries.scss';
import { fetchDataExplorerSuggestions } from "autoql-fe-utils";
import { CHATA_BUBBLES_ICON } from "../../../Svg";
import { createIcon } from "../../../Utils";
import './RelatedQueries.scss';

export function RelatedQueries({ icon, title, widget, subject }) {
  this.currentPage = 1;
  const container = document.createElement('div');
  const suggestionList = document.createElement('div');
  const list = document.createElement('div');
  const card = new Card({ icon, title, widget, subject });
  const {
    domain,
    apiKey,
    token,
  } = widget.options.authentication;

  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-query-suggestions-section');
  list.classList.add('autoql-vanilla-query-suggestion-list');
  suggestionList.classList.add('autoql-vanilla-data-explorer-query-suggestion-list');
  suggestionList.appendChild(list);
  card.setContent(suggestionList);
  container.appendChild(card);

  const getRelatedQueries = async() => {
    const relatedQueries = await fetchDataExplorerSuggestions({
      context: subject.name,
      skipQueryValidation: true,
      pageNumber: 1,
      pageSize: 25,
      domain,
      apiKey,
      token,
    });
    const { items } = relatedQueries.data.data;

    items.forEach((suggestion) => {
      const item = document.createElement('div');
      const icon = createIcon(CHATA_BUBBLES_ICON);
      const text = document.createElement('div');
      item.classList.add('autoql-vanilla-query-tip-item');
      item.classList.add('autoql-vanilla-animated-item');
      text.classList.add('autoql-vanilla-query-suggestion-text');

      text.appendChild(icon);
      text.appendChild(document.createTextNode(suggestion));
      item.appendChild(text);
      list.appendChild(item);

      item.onclick = () => {
        widget.tabChataUtils.classList.add('active');
        widget.tabQueryTips.classList.remove('active');
        widget.tabsAnimation('flex', 'block');
        widget.dataExplorer.hide();
        widget.notificationsAnimation('none');
        widget.keyboardAnimation(suggestion);
        widget.options.landingPage = 'data-messenger';
      }
    });

    console.log(items);
  }

  getRelatedQueries();

  return container;
}