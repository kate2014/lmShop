const domain = location.host;

export const IMAGE_DOMAIN = 'http://testbbcimage.leimingtech.com';
export const SERVER_DOMAIN = 'http://testbbc.leimingtech.com';

export const sign_key = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALp+nkNsb0dfqNq3TxQe53JNd/C3rRdoMG3l+n7CjTGA60y6O+ssZ/j5kzwFrVBaSwIkpBIX1j/NhOTf2s+ItwjU1dliKKD6Da4kBABaGJPwDSYZVo05PmaywRb11knijgXdIq4c/Yn4tIbagoE4pEkBWeKRe+EpUedsrn1mVh/lAgMBAAECgYB8zF58IAQXbxw/wItam5OmGdE5dLCQCVjfMhb+3JI/nlXXcojGR2EMa3bro6DnNIUdWgexU+I7r/xObL6wQny4d8UJNN6SWbLIxkb2YjoUk5SaBO7bqFlEiyWJN0cp21h9KQIwAlbHeGIpll5SIR5uMqx4gTXcIzOqtyz/xtSyAQJBANqHPN7R3Oe8ALmMBwIh7YmA9sL3osSu6zer6Wa0qBlntyuv+6eB1VvON8JlZOCFA3mJoRHvmKeq1JCiMEzhUjkCQQDaeTHL3NdbO1dYQgKhLwWV2JjpyskSF3xjlNNbS0e8nu0Vwn+f8GTba0tO/BeVkuaKLfX0NbhXt/2YYkdhQIsNAkBwdqkdA2Rs3pSA6U+yCUP2QCi+rjNWha8IN7Em6lKYwIfENA2PZ4ImfTq1EPmZktr28Z2zXVty7rf2t4GkD1IBAkB2P8LEJPQrXSMZkiD6PQk44dNiN3A9apjZDWSYtVZOsXaBoJSTbPoqCRjp12isfKZrhBTr6Wetktif8hHQga7BAkEAmhOwXzYFD1jqd+cvgh0ImdWBDfq2qrfqYFhne+o0iEzHxukOty+GLm/mmaAkb/VvLX75qf/zNMNrTk5ZwXgtBA=='

export function getFullUrl(requestUrl) {
  let url = location.protocol + '//' + domain;
  if (requestUrl.startsWith("/")) {
    url = url + requestUrl;
  } else {
    url = url + "/" + requestUrl;
  }

  return url;
}

export function isWechat() {
  return navigator.userAgent.indexOf('MicroMessenger') > -1;
}

export function isQQ() {
  return navigator.userAgent.indexOf('QQ') > -1;
}

/**
 * 去登录
 * @param {登录成功后返回的页面} callBack 
 */
export function gotoLogin(callBack) {
  if (callBack) {
    window.location.href = getFullUrl(`/login.html?callBack=${callBack}`);
  } else {
    window.location.href = getFullUrl('/login.html');
  }
}

export function gotoCart() {
  window.location.href = getFullUrl('/cart.html');
}

// 获取token
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * 是否登录
 */
export function isLogin() {
  const token = getToken();
  if (!token || token == '') {
    return false;
  }
  return true;
}

/**
 * 检查登录
 * @param {登录成功后返回的页面} callBack 
 */
export function checkLogin({ callBack }) {
  if (!isLogin()) {
    // 获取当前URL,作为登录回调
    const currentUrl = callBack || window.location.href;
    gotoLogin(currentUrl);
  }
}

export function setCartNum(num) {
  localStorage.setItem('_cartnum', num);
}

export function getCartNum() {
  return localStorage.getItem('_cartnum') || 0;
}
