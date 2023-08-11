import { Chip } from "../Chip/Chip";
import './ChipsContainer.scss';

export function ChipsContainer({ filters }) {
  const container = document.createElement('div');

  filters.map(filter => {
    container.appendChild(new Chip({ data: filter }));
  });

  container.classList.add('autoql-vanilla-data-alert-filters-container');

  return container;
}