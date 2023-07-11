import { createIcon } from '../../../Utils';
import { CARET_DOWN_ICON, CARET_LEFT_ICON} from '../../../Svg';
import './Card.scss'

export function Card({ icon, title }) {
  let obj = this;
  const container = document.createElement('div');
  const titleContainer = document.createElement('div');
  const titleWrapper = document.createElement('div');
  const titleText = document.createElement('div');
  const content = document.createElement('div');
  const userContent = document.createElement('div');
  const caretDown = createIcon(CARET_DOWN_ICON);
  const caretLeft = createIcon(CARET_LEFT_ICON);
  obj.isOpen = true;

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

  obj.show = () => {
    obj.isOpen = true;
    titleContainer.removeChild(caretLeft);
    titleContainer.appendChild(caretDown);
  }

  obj.hide = () => {
    obj.isOpen = false;
    titleContainer.removeChild(caretDown);
    titleContainer.appendChild(caretLeft);
  }

  titleContainer.onclick = () => {
    if(obj.isOpen) {
      obj.hide();
    }else{
      obj.show();
    }
  }

  return container;
}