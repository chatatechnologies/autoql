import './AppearanceView.scss';

export function AppearanceView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const composeMessageSection = document.createElement('div');
  
  const titleContainer = document.createElement('div');
  const titleInputLabel = document.createElement('div');

  title.textContent = 'Appearance';
  titleInputLabel.textContent = 'Title';

  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  composeMessageSection.classList.add('autoql-vanilla-compose-message-section');
  titleContainer.classList.add('autoql-vanilla-input-and-label-container');
  titleInputLabel.classList.add('autoql-vanilla-input-label');

  titleContainer.appendChild(titleInputLabel);
  composeMessageSection.appendChild(titleContainer);
  wrapper.appendChild(composeMessageSection);
  container.appendChild(title);
  container.appendChild(wrapper);
  return container;
}