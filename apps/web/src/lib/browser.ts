export function detectBrowser() {
  const userAgent = navigator.userAgent;
  if (userAgent.match(/chrome|chromium|crios/i)) return "Chrome";
  if (userAgent.match(/firefox|fxios/i)) return "Firefox";
  if (userAgent.match(/safari/i)) return "Safari";
  if (userAgent.match(/opr\//i)) return "Opera";
  if (userAgent.match(/edg/i)) return "Edge";
  if (userAgent.match(/android/i)) return "Android";
  if (userAgent.match(/iphone/i)) return "iPhone";
  return "Unknown";
}

/**
 *  @ref https://stackdiary.com/detect-mobile-bowser-javascript/
 */
export function isMobileBrowser() {
  return (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  );
}
