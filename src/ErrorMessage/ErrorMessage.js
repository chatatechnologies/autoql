import { htmlToElement } from '../Utils';
import { strings } from '../Strings';

import './ErrorMessage.css';

export function ErrorMessage(text = '', onClick = () => {}) {
    var div = document.createElement('div');

    var startTag = text.indexOf('<');
    var endTag = text.indexOf('>');
    var values = [];
    if (startTag != -1 && endTag != -1) {
        values.push(text.substr(0, startTag));
        values.push(text.substr(endTag, text.length).replace('<', '').replace('>', ''));
    }

    if (values.length > 1) {
        var link = document.createElement('a');
        div.innerHTML = values[0];
        link.innerHTML = strings.report;
        link.classList.add('autoql-vanilla-report-link');
        link.onclick = (evt) => {
            onClick(evt);
        };
        div.appendChild(link);
        div.appendChild(document.createTextNode(values[1]));
    } else {
        div.innerHTML = text;
    }

    return div;
}
