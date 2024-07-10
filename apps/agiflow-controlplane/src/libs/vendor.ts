// @ts-nocheck
/* eslint-disable */
export const tracking = () => {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', import.meta.env.VITE_GOOGLE_TAG);
};
