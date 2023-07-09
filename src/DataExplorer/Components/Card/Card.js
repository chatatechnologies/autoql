import { createIcon } from '../../../Utils';

export function Card({ icon, title }) {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const titleWrapper = document.createElement('div');
  const titleText = document.createElement('div');

  container.classList.add('autoql-vanilla-card');
  titleText.classList.add('autoql-vanilla-card-title-text');

  titleText.appendChild(createIcon(icon));
  titleText.appendChild(document.createTextNode(title));
  titleWrapper.appendChild(titleText);
  title.appendChild(titleWrapper);
  container.appendChild(title);
}