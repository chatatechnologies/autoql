export function DataPreview() {
  let obj = this;
  const container = document.createElement('div');

  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-data-preview-section');

  obj.container = container;

  return obj;
}