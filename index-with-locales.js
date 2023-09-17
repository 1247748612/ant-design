import * as antd from './components';

let locales = import.meta.glob('./components/locale/*_*.ts', { eager: true });

locales = Object.entries(locales).reduce((newLocales, [key, locale]) => {
  [, key] = key.match(/\/([A-Za-z]+_[A-Za-z]+)\.ts$/);
  newLocales[key] = locale.default;
  return newLocales;
}, {});

export default {
  ...antd,
  locales,
};
