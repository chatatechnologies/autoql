import { DATA_LIMIT_WARNING } from "../Svg";
import { createIcon } from "../Utils";
import './DataLimitWarningIcon.scss';
import { strings } from "../Strings";

export function DataLimitWarningIcon() {
  const container = document.createElement('div');
  const icon = createIcon(DATA_LIMIT_WARNING);
  icon.setAttribute('data-tippy-content', strings.dataRowLimit.chataFormat(500));
  container.classList.add('autoql-vanilla-data-limit-warning-icon');

  container.appendChild(icon);

  return container;
}