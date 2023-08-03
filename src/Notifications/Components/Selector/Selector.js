export function Selector() {
  const select = document.createElement('div');
  const selectText = document.createElement('span');
  const itemValue = document.createElement('span');

  itemValue.classList.add('autoql-vanilla-menu-item-value-title');
  selectText.classList.add('autoql-vanilla-select-text');
  select.classList.add('autoql-vanilla-select');
  select.classList.add('autoql-vanilla-outlined');
  select.classList.add('autoql-vanilla-select-large');

  itemValue.innerHTML = `<span><span>Is <strong>greater</strong> than</span></span>`;

  this.foo = () => {
    console.log('TEST');
  }

  selectText.appendChild(itemValue);
  select.appendChild(selectText);

  return select;
}