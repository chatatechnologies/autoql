export function TimingView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');

  title.textContent = 'Timing';
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');

  container.appendChild(title);
  container.appendChild(wrapper);

  return container;
}