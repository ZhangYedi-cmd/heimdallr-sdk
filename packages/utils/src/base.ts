import { TAG } from "@heimdallr-sdk/types";

/**
 * 判断当前环境是否支持console
 * @return {boolean} {boolean}
 */
export const hasConsole = (): boolean => typeof console !== 'undefined';

/**
 * 格式化url地址
 * @param {string} host - 域名地址
 * @param {string} path - 接口路径
 * @return {string}
 */
export const formateUrlPath = (host: string, path: string): string =>
  `${/^http(s|):\/\//.test(host || '') ? host : `//${(host || '').replace(/^http(s|):\/\//, '')}`}/${
    (path || '')[0] === '/' ? path.substring(1) : path
  }`;

/**
 * 获取url路径地址
 * @param {string} url - 域名地址
 * @return {string}
 */
export const getUrlPath = (url: string): string => {
  const path = `${(url || '').replace(/^http(s|):/, '').split('?')[0]}`;
  const endIndex = path.length - 1;
  return path[endIndex] === '/' ? path.substring(0, endIndex) : path;
};

/**
 * 获取对象属性值
 * @param {string} keyPath 属性路径
 * @param obj 目标对象
 */
 export function getDeepPropByDot(keyPath: string, obj: Object): any {
  if (!keyPath || !obj) {
    return null;
  }
  const copyTarget = { ...obj };
  const paths = keyPath.split('.');
  let result = copyTarget;
  for (const key of paths) {
    const value = result[key];
    if (!value) {
      console.warn(TAG, `${key} does not exist`);
      return null;
    }
    result = value;
  }
  return result;
}

