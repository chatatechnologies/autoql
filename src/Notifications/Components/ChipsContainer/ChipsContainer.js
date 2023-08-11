import { Chip } from "../Chip/Chip";

export function ChipsContainer({ filters }) {
  const container = document.createElement('autoql-vanilla-data-alert-filters-container');

  filters.map(filter => {
    container.appendChild(new Chip({ data: filter }));
  })

  return container;
}