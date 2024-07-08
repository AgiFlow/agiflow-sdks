import { ISession } from './Session';

export interface IApiClientConfig {
  endpoint: string;
  key: string;
}

/*
 * Feedback Widget Controller
 */
export interface Widget {
  session: ISession;
  apiConfig: IApiClientConfig;
}
