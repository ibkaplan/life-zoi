import { LOCALE_STORAGE_KEY, LOCALES } from "./config";

/** Sets `<html lang>` before the page paints, from the saved choice or the browser languages. */
export const LOCALE_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});var ok=${JSON.stringify(LOCALES)};var l=ok.indexOf(s)>=0?s:null;if(!l){var n=navigator.languages||[navigator.language||""];for(var i=0;i<n.length&&!l;i++){var b=String(n[i]).toLowerCase().split(/[-_]/)[0];if(ok.indexOf(b)>=0)l=b;}}document.documentElement.lang=l||"en";}catch(e){}})();`;
