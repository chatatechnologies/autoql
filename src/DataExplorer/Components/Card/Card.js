import { createIcon } from '../../../Utils';
import './Card.scss'

export function Card({ icon, title }) {
  const container = document.createElement('div');
  const titleContainer = document.createElement('div');
  const titleWrapper = document.createElement('div');
  const titleText = document.createElement('div');
  const content = document.createElement('div');

  container.classList.add('autoql-vanilla-card');
  titleText.classList.add('autoql-vanilla-card-title-text');
  titleContainer.classList.add('autoql-vanilla-card-title');
  content.classList.add('autoql-vanilla-card-content');

  titleText.appendChild(createIcon(icon));
  titleText.appendChild(document.createTextNode(title));
  titleWrapper.appendChild(titleText);
  titleContainer.appendChild(titleWrapper);
  container.appendChild(titleContainer);
  container.appendChild(content);

  return container;
}