/**
 * 
 * LmdStorage - a lightweight browser cookie wrapper
 * @copyright LMD-Code 2022
 * @see https://github.com/lmd-code/lmdcode-js-utils/
 * @version 0.1.0 - alpha
 * @license GPLv3 
 */

'use strict';

/**
 * Wrapper class for interacting with browser cookies
 */
class LmdCookie {
    /**
     * Initialise a cookie
     * @param {string} cookieKey - Name (key) of browser cookie
     * @param {string|null} path - path for cookie (default: null)
     * @param {string|null} domain - cookie domain (default: null)
     * @param {Boolean} secure - only send over https (default: false)
     * @param {string} sameSite - same-origin/cross-site requests (default: 'lax')
     * expires
     */
    constructor(cookieKey, path = null, domain = null, secure = false, sameSite = 'lax') {
        /** @private {string} cookieName - Cookie item key */
        this.cookieName = cookieKey;
        
        this.cookiePath = path;
        
        this.cookieDomain = domain;
        
        this.cookieSecure = secure;
        
        this.cookieSamesite = sameSite;

        /** @private {Object} data - Data items in key/value pairs */
        this.data = this.getCookie();

        /** @private {boolean} _isEnabled - Stores isEnabled result */
        this._isEnabled = null;
    }
    
    getCookie() {
        const cookies = document.cookie.split(';');
    }
    
    setCookie(value, expires) {
        let cookieText = encodeURIComponent(this.cookieName) + '=' + encodeURIComponent(value);
        
        cookieText += '; expires=';
        if (expires instanceof Date) {
            cookieText += expires.toGMTString();
        } else {
            cookieText += LmdCookie.calcExpiresDate(expires);
        }
        
        if (this.cookiePath) cookieText += '; path=' + this.cookiePath;
        if (this.cookieDomain) cookieText += '; domain=' + this.cookieDomain;
        if (this.cookieSecure) cookieText += '; secure';
        
        document.cookie = cookieText;
    }
    
    removeCookie() {
        this.setCookie('', new Date(0));
    }
    
    static calcExpiresDate(expires) {
        const now = new Date();
        let timeSpan = 0; // in seconds
        
        const tokens = expires.split(' ');
        
        for (let i = 0; i < tokens.length; i++) {
            const num = tokens[i][0];
            const tok = tokens[i][1].toUpperCase(); // e.g. Y, M, D, H, M, S
            
            switch (tok) {
                case 'Y':
                    timeSpan += (num * (60*60*24*365)); // not accurate
                    break;
                case 'M':
                    timeSpan += (num * (60*60*24*31)); // not accurate
                    break;
                case 'D':
                    timeSpan += (num * (60*60*24));
                    break;
                case 'H':
                    timeSpan += (num * (60*60));
                    break;
                case 'M':
                    timeSpan += (num * 60);
                    break;
                case 'S':
                    timeSpan += num;
                    break;
                default:
                    break;
            }
        }
    }
}