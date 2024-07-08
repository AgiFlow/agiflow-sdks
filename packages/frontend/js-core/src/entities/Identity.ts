interface IdentityOptions {
  name: string;
  uid: string;
}
/*
 * User identity object
 * By default, the user is anonimous within a single session
 */
export interface IIdentity {
  id: string;
  opts?: IdentityOptions;
}
