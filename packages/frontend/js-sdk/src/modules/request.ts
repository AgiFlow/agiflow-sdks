export const extractUrlAndHost = (url: URL | RequestInfo) => {
  let host: string | undefined = undefined;
  let urlString: string | undefined = undefined;
  if (url instanceof URL) {
    host = url.host;
    urlString = url.href;
  } else if (url instanceof Request) {
    const urlObj = new URL(url.url);
    host = urlObj.host;
    urlString = urlObj.href;
  } else {
    try {
      const urlObj = new URL(url);
      host = urlObj.host;
      urlString = urlObj.href;
    } catch (_) {
      urlString = url;
    }
  }
  return { urlString, host };
};
