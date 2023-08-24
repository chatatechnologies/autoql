import { DATA_LIMIT_WARNING } from "../Svg";
import { createIcon } from "../Utils";
import './DataLimitWarningIcon.scss';

export function DataLimitWarningIcon() {
  const container = document.createElement('div');

  container.classList.add('autoql-vanilla-data-limit-warning-icon');

  container.appendChild(createIcon(DATA_LIMIT_WARNING));

  return container;
}