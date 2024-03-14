import { Chip } from "../Chip/Chip";
import './ChipsContainer.scss';

export function ChipsContainer({ filters }) {
  const container = document.createElement('div');

  filters.map(filter => {
    container.appendChild(new Chip({ data: filter }));
  });

  container.getValues = () => {
    const chips = container.querySelectorAll('.autoql-vanilla-chip');
    const values = [];
    chips.forEach(chip => values.push(chip.getData()));
    
    return values;
  }

  container.classList.add('autoql-vanilla-data-alert-filters-container');

  return container;
}