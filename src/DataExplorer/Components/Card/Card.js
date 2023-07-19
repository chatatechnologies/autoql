import { createIcon } from '../../../Utils';
import { CARET_DOWN_ICON, CARET_LEFT_ICON} from '../../../Svg';
import './Card.scss'

export function Card({ icon, title, maxHeight, onScroll = () => {} }) {
  const container = document.createElement('div');
  const titleContainer = document.createElement('div');
  const titleWrapper = document.createElement('div');
  const titleText = document.createElement('div');
  const content = document.createElement('div');
  const userContent = document.createElement('div');
  const caretDown = createIcon(CARET_DOWN_ICON);
  const caretLeft = createIcon(CARET_LEFT_ICON);
  container.isOpen = true;
  content.style.maxHeight = `${maxHeight}px`;
  content.style.height = `${maxHeight}px`;
  container.classList.add('autoql-vanilla-card');
  titleText.classList.add('autoql-vanilla-card-title-text');
  titleContainer.classList.add('autoql-vanilla-card-title');
  userContent.classList.add('autoql-vanilla-card-user-content');
  content.classList.add('autoql-vanilla-card-content');

  titleText.appendChild(createIcon(icon));
  titleText.appendChild(document.createTextNode(title));
  titleWrapper.appendChild(titleText);
  titleContainer.appendChild(titleWrapper);
  titleContainer.appendChild(caretDown);
  content.appendChild(userContent);
  container.appendChild(titleContainer);
  container.appendChild(content);

  container.show = () => {
    container.isOpen = true;
    titleContainer.removeChild(caretLeft);
    titleContainer.appendChild(caretDown);
    content.style.maxHeight = `${maxHeight}px`;
    content.classList.remove('autoql-vanilla-hidden');
  }

  container.hide = () => {
    container.isOpen = false;
    titleContainer.removeChild(caretDown);
    titleContainer.appendChild(caretLeft);
    content.style.maxHeight = '0px'; 
    content.classList.add('autoql-vanilla-hidden');
  }

  container.clearView = () => {
    userContent.innerHTML = '';
  }

  container.setContent = (node) => {
    userContent.appendChild(node)
  }

  container.showLoading = () => {
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');

    responseLoadingContainer.classList.add('autoql-vanilla-card-loading');
    responseLoading.classList.add('response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    userContent.appendChild(responseLoadingContainer);
  };

  userContent.addEventListener('scroll', () => {
    const endOfPage =
    userContent.clientHeight + userContent.scrollTop >= userContent.scrollHeight;
    if (endOfPage) {
      onScroll()
    }
  })

  titleContainer.onclick = () => {
    if(container.isOpen) {
      container.hide();
    }else{
      container.show();
    }
  }

  return container;
}