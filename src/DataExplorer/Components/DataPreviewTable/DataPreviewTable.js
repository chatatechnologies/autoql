import './DataPreview.scss'

export function DataPreviewTable({ previewResponse }) {
  const container = document.createElement('div');
  const scroll = document.createElement('div');
  console.log(previewResponse);
  container.classList.add('autoql-vanilla-data-preview');
  scroll.classList.add('autoql-vanilla-data-preview-scroll');

  container.appendChild(scroll);

  return container;
}