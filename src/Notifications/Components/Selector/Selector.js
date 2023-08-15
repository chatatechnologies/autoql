import { PopoverChartSelector } from '../../../Charts/PopoverChartSelector';
import { Popup } from '../../../Popup';
import { SELECT_ARROW } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './Selector.scss';

export function Selector({ defaultValue, options, onChange = () => {} }) {
  const select = document.createElement('div');
  const selectText = document.createElement('span');
  const itemValue = document.createElement('span');
  const selectArrow = document.createElement('div');
  const arrow = createIcon(SELECT_ARROW);
  const optionsContainer = document.createElement('ul');
  const popup = new Popup();
  
  select.isOpen = false;
  select.value = defaultValue;
  
  itemValue.classList.add('autoql-vanilla-menu-item-value-title');
  selectArrow.classList.add('autoql-vanilla-select-arrow');
  selectText.classList.add('autoql-vanilla-select-text');
  optionsContainer.classList.add('autoql-vanilla-select-menu');
  select.classList.add('autoql-vanilla-select');
  select.classList.add('autoql-vanilla-outlined');
  select.classList.add('autoql-vanilla-select-large');
  
  if(defaultValue) {
    const finded = options.find(o => o.value === defaultValue)
    if(finded) {
      itemValue.innerHTML = finded.displayName;
    }
  }

  options.forEach((option) => {
    const item = document.createElement('li');
    item.classList.add('autoql-vanilla-select-menu-item');
    optionsContainer.appendChild(item);

    const name = option?.displayText ?? option.displayName;
    item.innerHTML = name;

    item.onclick = () => {
      itemValue.innerHTML = option.displayName;
      select.value = option.value;
      select.closePopup();
      onChange(option);
    }
  })

  select.closePopup = () => {
    popup.close();
    select.isOpen = false;
  }

  select.openPopup = () => {
    var pos = select.getBoundingClientRect();
    popup.show({ x: pos.left, y: pos.bottom + 2 });
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