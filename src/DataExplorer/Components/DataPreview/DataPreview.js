import { Card } from "../Card";

export function DataPreview({ icon, title }) {
  let obj = this;
  const container = document.createElement('div');
  const card = new Card({ icon, title });

  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-data-preview-section');

  container.appendChild(card);

  obj.container = container;

  return obj;
}