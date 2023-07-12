import { Card } from "../Card";
import './RelatedQueries.scss';

export function RelatedQueries({ icon, title }) {
  const container = document.createElement('div');
  const card = new Card({ icon, title });
  
  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-query-suggestions-section');
  container.appendChild(card);

  return container;
}