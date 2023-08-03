export function NumberInput() {
  const container = document.createElement('div');
  const btnUp = document.createElement('button');
  const btnDown = document.createElement('button');
  const spinButtonContainer = document.createElement('div');

  const input = document.createElement('input');

  spinButtonContainer.appendChild(btnUp);
  spinButtonContainer.appendChild(btnDown);

  input.classList.add('autoql-vanilla-number-input');
  input.setAttribute('placeholder', 'Type a number');
  input.setAttribute('type', 'number');
  input.setAttribute('spellcheck', 'number');

  container.appendChild(input);
  container.appendChild(spinButtonContainer);

  return container;
}