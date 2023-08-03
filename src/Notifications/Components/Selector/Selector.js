import { SELECT_ARROW } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './Selector.scss';

export function Selector({ defaultIndex, options }) {
  const select = document.createElement('div');
  const selectText = document.createElement('span');
  const itemValue = document.createElement('span');
  const selectArrow = document.createElement('div');
  const arrow = createIcon(SELECT_ARROW);
  const optionsContainer = document.createElement('ul');
  const popup = document.createElement('div');
  const item = document.createElement('li');

  itemValue.classList.add('autoql-vanilla-menu-item-value-title');
  selectArrow.classList.add('autoql-vanilla-select-arrow');
  selectText.classList.add('autoql-vanilla-select-text');
  optionsContainer.classList.add('autoql-vanilla-select-menu');
  item.classList.add('autoql-vanilla-select-menu-item');
  popup.classList.add('autoql-vanilla-select-popup');
  select.classList.add('autoql-vanilla-select');
  select.classList.add('autoql-vanilla-outlined');
  select.classList.add('autoql-vanilla-select-large');

  itemValue.innerHTML = `<span><span>Is <strong>greater</strong> than</span></span>`;
  item.innerHTML = `<span><span>Is <strong>greater</strong> than (>)</span></span>`;

  optionsContainer.appendChild(item);
  selectArrow.appendChild(arrow);
  selectText.appendChild(itemValue);
  popup.appendChild(optionsContainer);
  document.body.appendChild(popup);
  select.appendChild(selectText);
  select.appendChild(selectArrow);

  return select;
}