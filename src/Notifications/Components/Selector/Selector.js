import { PopoverChartSelector } from '../../../Charts/PopoverChartSelector';
import { SELECT_ARROW } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './Selector.scss';

export function Selector({ defaultValue, options }) {
  const select = document.createElement('div');
  const selectText = document.createElement('span');
  const itemValue = document.createElement('span');
  const selectArrow = document.createElement('div');
  const arrow = createIcon(SELECT_ARROW);
  const optionsContainer = document.createElement('ul');
  const popup = document.createElement('div');
  
  select.isOpen = false;
  
  itemValue.classList.add('autoql-vanilla-menu-item-value-title');
  selectArrow.classList.add('autoql-vanilla-select-arrow');
  selectText.classList.add('autoql-vanilla-select-text');
  optionsContainer.classList.add('autoql-vanilla-select-menu');
  popup.classList.add('autoql-vanilla-select-popup');
  select.classList.add('autoql-vanilla-select');
  select.classList.add('autoql-vanilla-outlined');
  select.classList.add('autoql-vanilla-select-large');
  
  if(defaultValue) {
    itemValue.innerHTML = options[0].displayName;
  }

  options.forEach((option) => {
    const item = document.createElement('li');
    item.classList.add('autoql-vanilla-select-menu-item');
    optionsContainer.appendChild(item);

    const name = option.displayText;
    item.innerHTML = name;

    item.onclick = () => {
      itemValue.innerHTML = option.displayName;
      select.closePopup();
    }
  })

  select.closePopup = () => {
    popup.style.visibility = 'hidden';
    document.body.removeChild(popup);
    select.isOpen = false;
  }

  select.openPopup = () => {
    var pos = select.getBoundingClientRect();
    popup.style.transform = `translate(${pos.left}px, ${pos.bottom + 2}px)`;
    popup.style.visibility = 'visible';
    document.body.appendChild(popup);
    select.isOpen = true;
  }

  select.onclick = () => {
    if(!this.isOpen){
      select.openPopup();
    }else{
      select.closePopup();
    }
  }
  
  selectArrow.appendChild(arrow);
  selectText.appendChild(itemValue);
  popup.appendChild(optionsContainer);
  select.appendChild(selectText);
  select.appendChild(selectArrow);

  return select;
}