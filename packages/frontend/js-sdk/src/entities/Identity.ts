interface IdentityOptions {
  name: string;
  uid: string;
}
/*
 * User identity object
 * By default, the user is anonimous within a single session
 */
export class Identity {
  id: string;
  opts?: IdentityOptions;

  constructor(id: string, opts?: IdentityOptions) {
    this.id = id;
    this.opts = opts;
  }

  hydrate() {
    return {
      id: this.id,
      opts: this.opts,
    };
  }

  static dehydrate(data: Identity) {
    const identity = new Identity(data.id, data.opts);
    return identity;
  }
}
