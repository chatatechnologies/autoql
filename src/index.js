import { configureTheme as configureThemeUtils, getSupportedDisplayTypes } from 'autoql-fe-utils';
import { Dashboard } from './Dashboard';
import { DataMessenger } from './DataMessenger';
import { DataAlerts, NotificationFeed, NotificationIcon } from './Notifications';
import { QueryInput } from './QueryInput';
import { QueryOutput } from './QueryOutput';
import { CSS_PREFIX } from './Constants';
import './index.scss';

export { DataMessenger } from './DataMessenger';
export { Dashboard } from './Dashboard';
export { NotificationIcon } from './Notifications';
export { NotificationFeed } from './Notifications';
export { DataAlerts } from './Notifications';
export { QueryInput } from './QueryInput';
export { QueryOutput } from './QueryOutput';
export { getSupportedDisplayTypes } from 'autoql-fe-utils';

export const configureTheme = (customThemeConfig) => configureThemeUtils(customThemeConfig, CSS_PREFIX);

export default {
    DataMessenger,
    Dashboard,
    NotificationIcon,
    NotificationFeed,
    DataAlerts,
    QueryInput,
    QueryOutput,
    configureTheme,
    getSupportedDisplayTypes,
};
