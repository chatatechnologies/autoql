import { create } from "d3";
import { CLOSE_ICON, ICON_LOCK } from "../../../Svg";
import { createIcon } from "../../../Utils";
import './Chip.scss'

export function Chip({ data }) {
  const chip = document.createElement('div');
  const background = document.createElement('div');
  const content = document.createElement('div');
  const contentWrapper = document.createElement('div');
  const message = document.createElement('strong');

  const btnDeleteChip = document.createElement('div');
  const closeIcon = createIcon(CLOSE_ICON);
  const lockIcon = createIcon(ICON_LOCK);

  chip.classList.add('autoql-vanilla-chip');
  background.classList.add('autoql-vanilla-chip-background');
  content.classList.add('autoql-vanilla-chip-content');
  btnDeleteChip.classList.add('autoql-vanilla-chip-delete-confirm-popover');
  closeIcon.classList.add('autoql-vanilla-chip-delete-btn');
  lockIcon.classList.add('autoql-vanilla-lock-icon');
  
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

  return chip;
}