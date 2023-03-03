import { BaseOptionsType, BasePluginType, CoreContextType, IAnyObject, ConsoleTypes, TAG } from '@heimdallr-sdk/types';
import { formateUrlPath, objDeepCopy, hasConsole } from '@heimdallr-sdk/utils';
import { Subscribe } from './subscribe';

/**
 * 核心抽象类
 * @export
 * @class Core
 * @template O 配置信息
 * @template E 事件枚举
 */
export abstract class Core<O extends BaseOptionsType> {
  private readonly options: O;

  public context: CoreContextType;

  constructor(options: O) {
    if (!this.isRightEnv()) {
      this.log('Client does not match the environment');
      return;
    }
    this.options = options;
    this.bindOptions();
    this.initAPP();
  }

  /**
   * 绑定配置
   */
  private bindOptions() {
    const { dsn, app, debug = false, enabled = true } = this.options;

    if (!app || !dsn) {
      this.log('Mising app or dsn in options');
      return;
    }

    const { host, init, upload = '' } = dsn;
    const initUrl = formateUrlPath(host, init);
    const uploadUrl = formateUrlPath(host, upload);

    this.context = {
      app,
      uploadUrl,
      initUrl,
      debug,
      enabled
    };
  }

  /**
   * 引用插件
   * @param {BasePluginType[]} plugins - 用户传入的应用信息
   */
  use(plugins: BasePluginType[]): void {
    const { uploadUrl, enabled } = this.context;
    const sub = new Subscribe();
    for (const plugin of plugins) {
      plugin.monitor.call(this, sub.notify.bind(sub, plugin.name));
      const callback = (...args: any[]) => {
        const pluginDatas = plugin.transform.apply(this, args);
        const datas = this.transform(pluginDatas);
        if (!datas) {
          return;
        }
        if (enabled) {
          this.nextTick(this.report, this, uploadUrl, datas);
        }
      };
      sub.watch(plugin.name, callback);
    }
  }

  /**
   * 获取配置信息
   * @return {O} 配置信息
   */
  getOptions(): O {
    return objDeepCopy(this.options);
  }

  /**
   * 控制台输出
   * @param message
   * @param {ConsoleTypes} type
   */
  log(message: any, type: ConsoleTypes = ConsoleTypes.WARN): void {
    const { debug } = this.context;
    if (!hasConsole() || !debug) {
      return;
    }
    const func = console[type] as (...data: any[]) => void;
    if (typeof func !== 'function') {
      this.log('Type does not exist');
      return;
    }
    func(TAG, message);
  }

  /**
   * 抽象方法，判断当前环境
   */
  abstract isRightEnv(): boolean;

  /**
   * 抽象方法，nextTick
   */
  abstract nextTick(cb: Function, ctx: Object, ...args: any[]): void;

  /**
   * 抽象方法，注册/初始化应用
   */
  abstract initAPP(): void;

  /**
   * 抽象方法，端的个性化数据，需子类自己实现
   * @param {IAnyObject} datas
   */
  abstract transform(datas: IAnyObject): IAnyObject;

  /**
   * 抽象方法，端的请求方式不一致，需子类自己实现
   * @param {string} url - 接口地址
   * @param {} type - 请求方式（枚举类型，各端有差异）
   * @param {IAnyObject} datas - 上传数据
   */
  abstract report(url: string, datas: IAnyObject, type?: any): void;
}
