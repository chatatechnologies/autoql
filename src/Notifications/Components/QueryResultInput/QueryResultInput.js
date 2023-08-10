import { ARROW_DOWN, ARROW_UP } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './QueryResultInput.scss';

export function QueryResultInput({ termInputType, inputDefaultValue }) {
  const container = document.createElement('div');
  const btnUp = document.createElement('button');
  const btnDown = document.createElement('button');
  const spinButtonContainer = document.createElement('div');

  const input = document.createElement('input');

  btnUp.appendChild(createIcon(ARROW_UP));
  btnDown.appendChild(createIcon(ARROW_DOWN));

  spinButtonContainer.appendChild(btnUp);
  spinButtonContainer.appendChild(btnDown);

  btnUp.classList.add('autoql-vanilla-spin-button');
  btnDown.classList.add('autoql-vanilla-spin-button');
  spinButtonContainer.classList.add('autoql-vanilla-input-number-spin-button-container')

  input.classList.add('autoql-vanilla-number-input');
  input.setAttribute('type', 'number');
  
  container.appendChild(input);
  container.appendChild(spinButtonContainer);
  
  container.classList.add('autoql-vanilla-input-number-container');
  
  container.setInputType = (type) => {
    input.setAttribute('type', type);
    
    if(type === 'number') {
      input.setAttribute('spellcheck', 'number');
      input.setAttribute('placeholder', 'Type a number');
      spinButtonContainer.style.display = 'flex';
    } else {
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('placeholder', 'Type a query');
      spinButtonContainer.style.display = 'none';
    }
    input.value = '';
  }
  
  container.setInputType(termInputType);
  input.value = inputDefaultValue;

  return container;
}