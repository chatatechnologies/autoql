export function AppearanceStep({ queryResponse }) {
  const container = document.createElement('div');

  container.textContent = 'AppearanceStep';
  container.classList.add('autoql-vanilla-data-alert-modal-step');

  return container;
}