import { SELECT_ARROW } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './Selector.scss';

export function Selector() {
  const select = document.createElement('div');
  const selectText = document.createElement('span');
  const itemValue = document.createElement('span');
  const selectArrow = document.createElement('div');
  const arrow = createIcon(SELECT_ARROW);

  itemValue.classList.add('autoql-vanilla-menu-item-value-title');
  selectArrow.classList.add('autoql-vanilla-select-arrow');
  selectText.classList.add('autoql-vanilla-select-text');
  select.classList.add('autoql-vanilla-select');
  select.classList.add('autoql-vanilla-outlined');
  select.classList.add('autoql-vanilla-select-large');

  itemValue.innerHTML = `<span><span>Is <strong>greater</strong> than</span></span>`;

  this.foo = () => {
    console.log('TEST');
  }
  selectArrow.appendChild(arrow);
  selectText.appendChild(itemValue);
  select.appendChild(selectText);
  select.appendChild(selectArrow);

  return select;
}