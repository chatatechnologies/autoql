import { Card } from "../Card";
import './RelatedQueries.scss';
import { fetchDataExplorerSuggestions } from "autoql-fe-utils";
import { CHATA_BUBBLES_ICON } from "../../../Svg";
import { createIcon } from "../../../Utils";
import './RelatedQueries.scss';

export function RelatedQueries({ 
  icon, title, widget, subject, textBarHeight, containerHeight, previewSectionHeight 
}) {
  this.currentPage = 1;
  const container = document.createElement('div');
  const suggestionList = document.createElement('div');
  const list = document.createElement('div');
  const headerHeight = widget.header.clientHeight;
  const padding = 10;
  const margin = 40;
  const titleHeight = 37;
  const maxHeight = (containerHeight - previewSectionHeight - headerHeight - textBarHeight - titleHeight - margin - padding);
  let pageNumber = 1;
  const getRelatedQueries = async({ pageNumber }) => {
    const relatedQueries = await fetchDataExplorerSuggestions({
      context: subject.name,
      skipQueryValidation: true,
      pageSize: 25,
      domain,
      apiKey,
      token,
      pageNumber,
    });
    const { items } = relatedQueries.data.data;

    items.forEach((suggestion) => {
      const item = document.createElement('div');
      const icon = createIcon(CHATA_BUBBLES_ICON);
      const text = document.createElement('div');
      item.classList.add('autoql-vanilla-query-tip-item');
      item.classList.add('autoql-vanilla-animated-item');
      text.classList.add('autoql-vanilla-query-suggestion-text');

      item.onclick = () => {
        widget.setActiveTab(widget.tabChataUtils);
        widget.tabsAnimation('flex', 'block');
        widget.dataExplorer.hide();
        widget.notificationsAnimation('none');
        widget.keyboardAnimation(suggestion);
        widget.options.landingPage = 'data-messenger';
      }
      text.appendChild(icon);
      text.appendChild(document.createTextNode(suggestion));
      item.appendChild(text);
      list.appendChild(item);
    });
  }

  const onScroll = () => {
    pageNumber++;
    getRelatedQueries({ pageNumber })
  }

  const card = new Card({ icon, title, widget, subject, maxHeight, onScroll });
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

  getRelatedQueries(pageNumber);

  return container;
}