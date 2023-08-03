import { create } from 'd3';
import { ARROW_DOWN, ARROW_UP } from '../../../Svg';
import { createIcon } from '../../../Utils';
import './NumberInput.scss';

export function NumberInput() {
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
  input.setAttribute('placeholder', 'Type a number');
  input.setAttribute('type', 'number');
  input.setAttribute('spellcheck', 'number');

  container.appendChild(input);
  container.appendChild(spinButtonContainer);

  container.classList.add('autoql-vanilla-input-number-container');

  return container;
}