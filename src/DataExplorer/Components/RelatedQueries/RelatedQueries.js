import { Card } from "../Card";
import './RelatedQueries.scss';
import { fetchDataExplorerSuggestions } from "autoql-fe-utils";

export function RelatedQueries({ icon, title, widgetOptions, subject }) {
  const container = document.createElement('div');
  const card = new Card({ icon, title, widgetOptions, subject });
  const {
    domain,
    apiKey,
    token,
  } = widgetOptions.authentication;

  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-query-suggestions-section');
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
    })
  }

  getRelatedQueries();

  return container;
}