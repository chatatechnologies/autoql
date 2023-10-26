import { configureTheme } from 'autoql-fe-utils';
import { CSS_PREFIX } from '../Constants';

export const checkAndApplyTheme = (themeConfig) => {
    const hasTheme = !!document.documentElement.style.getPropertyValue(`--${CSS_PREFIX}-accent-color`);
    if (!hasTheme || themeConfig) {
        configureTheme(themeConfig, CSS_PREFIX);
    }
};
