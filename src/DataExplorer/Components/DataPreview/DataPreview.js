import { Card } from "../Card";
import './DataPreview.scss';
import { fetchDataPreview } from 'autoql-fe-utils'; 

export function DataPreview({ icon, title, subject, authentication }) {
  let obj = this;
  const container = document.createElement('div');
  const card = new Card({ icon, title });
  const {
    domain,
    apiKey,
    token,
  } = authentication;
  
  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-data-preview-section');

  container.appendChild(card);

  obj.container = container;

  obj.getPreview = async() => {
    const response = await fetchDataPreview({
      subject: subject.name,
      domain,
      apiKey,
      token,
    });
  }

  obj.getPreview();

  return obj;
}