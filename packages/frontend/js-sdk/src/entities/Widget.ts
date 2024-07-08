import { ApiClientConfig } from '../services/api';
import { IViewType } from '../types';
import { Session } from './Session';

const WIDGET_ID = 'agiflow-feedback';

export type IWidgetConfig = { views?: IViewType[] };

/*
 * Feedback Widget Controller
 */
export class Widget {
  session: Session;
  apiConfig: ApiClientConfig;
  widgetConfig: IWidgetConfig | undefined;
  loaded = false;
  loading = false;

  constructor(session: Session, apiConfig: ApiClientConfig, widgetConfig: IWidgetConfig) {
    this.session = session;
    this.apiConfig = apiConfig;
    this.widgetConfig = widgetConfig;
  }

  init() {
    this.getNode();
    this.render();
  }

  /**
   * Lazy load widget from CDN to reduce initial javascript bundle size
   */
  async load() {
    return new Promise(resolve => {
      const agiflowFeedback = globalThis.agiflowFeedback;
      if (agiflowFeedback?.render || this.loading) {
        this.loaded = true;
        resolve(null);
      }
      const script = document.createElement('script');
      this.loading = true;
      script.onload = () => {
        this.loaded = true;
        this.loading = false;
        resolve(null);
      };
      script.src = 'https://assets.agiflow.io/assets/agiflow-feedback-v0.0.4.js';

      document.head.appendChild(script);
    });
  }

  /**
   * Get element to render widget into
   **/
  getNode() {
    const widgetNode = document.querySelector(`#${WIDGET_ID}`);
    if (!widgetNode) {
      const widgetNode = document.createElement('div');
      widgetNode.setAttribute('id', WIDGET_ID);
      document.body.append(widgetNode);
    }
    return widgetNode;
  }

  /**
   * Render widget from global
   */
  async render() {
    const widgetNode = this.getNode();
    await this.load();
    (window as any).AgiflowFeedback.render(widgetNode, {
      session: this.session,
      apiConfig: this.apiConfig,
      onClose: this.onClose,
      ...(this.widgetConfig || {}),
    });
  }

  onClose() {
    document.getElementById(WIDGET_ID)?.remove();
    this.session.reset();
  }
}
