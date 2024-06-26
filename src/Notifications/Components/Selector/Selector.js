import { Popup } from '../../../Popup';
import { CARET_DOWN_ICON } from '../../../Svg';
import { createIcon, uuidv4 } from '../../../Utils';
import './Selector.scss';

export function Selector({ defaultValue, options, outlined = true, onChange = () => {} }) {
    const selectID = `autoql-vanilla-select-${uuidv4()}`;

    const select = document.createElement('div');
    const selectText = document.createElement('span');
    const itemValue = document.createElement('span');
    const selectArrow = document.createElement('div');
    const arrow = createIcon(CARET_DOWN_ICON);
    arrow.classList.add(selectID);

    const optionsContainer = document.createElement('ul');

    const popup = new Popup();

    select.isOpen = false;
    select.value = defaultValue;

    itemValue.classList.add('autoql-vanilla-menu-item-value-title');
    itemValue.classList.add(selectID);
    selectArrow.classList.add('autoql-vanilla-select-arrow');
    selectArrow.classList.add(selectID);
    selectText.classList.add('autoql-vanilla-select-text');
    selectText.classList.add(selectID);
    optionsContainer.classList.add('autoql-vanilla-select-menu');
    select.classList.add('autoql-vanilla-select');
    select.classList.add(selectID);
    select.classList.add('autoql-vanilla-select-large');

    if (outlined) {
        select.classList.add('autoql-vanilla-outlined');
    }

    if (defaultValue) {
        const finded = options.find((o) => o.value === defaultValue);
        if (finded) {
            itemValue.innerHTML = finded.displayName;
        }
    }

    options.forEach((option) => {
        const item = document.createElement('li');
        item.classList.add('autoql-vanilla-select-menu-item');
        optionsContainer.appendChild(item);

        const name = option?.displayText ?? option.displayName;
        item.innerHTML = name;

        item.onclick = () => {
            itemValue.innerHTML = option.displayName;
            select.value = option.value;
            select.closePopup();
            onChange(option);
        };
    });

    const onOutsideClick = (e) => {
        const classIgnoreList = [popup.ID, selectID];

        for (let i = 0; i < classIgnoreList.length; i++) {
            let c = classIgnoreList[i];
            if (
                e.target.classList.contains(c) ||
                e.srcElement?.offsetParent?.classList?.contains(c) ||
                e.srcElement?.parentElement?.classList?.contains(c)
            ) {
                return;
            }
        }

        select.closePopup();
    };

    select.closePopup = () => {
        document.removeEventListener('click', onOutsideClick);

        popup.close();
        select.isOpen = false;
    };

    select.openPopup = () => {
        document.addEventListener('click', onOutsideClick);

        var pos = select.getBoundingClientRect();
        popup.show({ x: pos.left, y: pos.bottom + 2 });
        select.isOpen = true;
    };

    select.onclick = () => {
        select.openPopup();
    };

    selectArrow.appendChild(arrow);
    selectText.appendChild(itemValue);
    popup.appendChild(optionsContainer);
    select.appendChild(selectText);
    select.appendChild(selectArrow);

    return select;
}
