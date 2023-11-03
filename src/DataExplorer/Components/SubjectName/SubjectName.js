import { DataExplorerTypes } from 'autoql-fe-utils';
import { createIcon } from '../../../Utils';
import { BOOKMARK_ICON, BOOK_ICON } from '../../../Svg';

export function SubjectName({ subject } = {}) {
    if (!subject) {
        return null;
    }

    var iconType = null;
    if (subject.type === DataExplorerTypes.SUBJECT_TYPE) {
        iconType = BOOK_ICON;
    } else if (subject.type === DataExplorerTypes.VL_TYPE) {
        iconType = BOOKMARK_ICON;
    }

    let suffix = '';
    if (subject.type === DataExplorerTypes.VL_TYPE && subject.formattedType) {
        suffix = ` (${subject.formattedType})`;
    }

    const subjectNameIcon = createIcon(iconType);
    subjectNameIcon.classList.add('autoql-vanilla-data-explorer-topic-icon');

    const subjectNameText = `${subject.type === DataExplorerTypes.TEXT_TYPE ? '"' : ''}${subject.displayName}${suffix}${
        subject.type === DataExplorerTypes.TEXT_TYPE ? '"' : ''
    }`;

    const subjectName = document.createElement('span');
    subjectName.append(subjectNameIcon);
    subjectName.append(subjectNameText);

    return subjectName;
}
