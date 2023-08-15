import { Popup } from "../../../Popup";
import { CLOSE_ICON, ICON_LOCK } from "../../../Svg";
import { createIcon } from "../../../Utils";
import './Chip.scss'

export function Chip({ data }) {
  this.values = data;
  const chip = document.createElement('div');
  const background = document.createElement('div');
  const content = document.createElement('div');
  const contentWrapper = document.createElement('div');
  const message = document.createElement('strong');

  const btnDeleteChip = document.createElement('div');
  const closeIcon = createIcon(CLOSE_ICON);
  const lockIcon = createIcon(ICON_LOCK);

  const confirmPopup = new Popup();
  const confirmContent = document.createElement('div');
  const popoverTitle = document.createElement('div');
  const buttonContainer = document.createElement('div');
  const btnCancel = document.createElement('button');
  const btnConfirm = document.createElement('button');

  popoverTitle.textContent = 'Remove this filter?';
  btnCancel.textContent = 'Cancel';
  btnConfirm.textContent = 'Remove';

  chip.classList.add('autoql-vanilla-chip');
  background.classList.add('autoql-vanilla-chip-background');
  content.classList.add('autoql-vanilla-chip-content');
  btnDeleteChip.classList.add('autoql-vanilla-chip-delete-confirm-popover');
  closeIcon.classList.add('autoql-vanilla-chip-delete-btn');
  lockIcon.classList.add('autoql-vanilla-lock-icon');
  confirmContent.classList.add('autoql-vanilla-confirm-popover-content');
  popoverTitle.classList.add('autoql-vanilla-confirm-popover-title');
  buttonContainer.classList.add('autoql-vanilla-confirm-popover-button-container');
  btnCancel.classList.add('autoql-vanilla-chata-btn');
  btnCancel.classList.add('autoql-vanilla-default');
  btnCancel.classList.add('autoql-vanilla-medium');
  btnConfirm.classList.add('autoql-vanilla-chata-btn');
  btnConfirm.classList.add('autoql-vanilla-primary');
  btnConfirm.classList.add('autoql-vanilla-medium');

  buttonContainer.appendChild(btnCancel);
  buttonContainer.appendChild(btnConfirm);
  confirmContent.appendChild(popoverTitle);
  confirmContent.appendChild(buttonContainer);
  confirmPopup.appendChild(confirmContent);

  btnDeleteChip.appendChild(closeIcon);

  message.appendChild(lockIcon);
  message.appendChild(document.createTextNode(`${data.show_message}`));
  message.appendChild(document.createTextNode(': '));
  contentWrapper.appendChild(message);
  contentWrapper.appendChild(document.createTextNode(data.value));
  content.appendChild(contentWrapper);
  content.appendChild(btnDeleteChip);
  chip.appendChild(content);
  chip.appendChild(background);

  btnDeleteChip.onclick = () => {
    const pos = chip.getBoundingClientRect();
    console.log(confirmPopup.clientHeight)
    confirmPopup.show({ x: pos.left, y: pos.bottom + 2 });
  }

  btnCancel.onclick = () => {
    confirmPopup.close();
  }

  btnConfirm.onclick = () => {
    chip.remove();
    confirmPopup.close();
  }

  chip.getData = () => {
    return this.values;
  }

  return chip;
}