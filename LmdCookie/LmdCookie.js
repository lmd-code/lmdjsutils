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
     * @param {boolean} secure - only send over https (default: false)
     * @param {string} sameSite - same-origin/cross-site policy (default: 'lax')
     * expires
     */
    constructor(cookieKey, path = null, domain = null, secure = false, sameSite = 'lax') {
        /** @private {string} cookieName - Cookie item key */
        this.cookieName = cookieKey;
        
        /** @private {string|null} cookiePath - path for cookie */
        this.cookiePath = path;
        
        /** @private {string|null} cookieDomain - cookie domain */
        this.cookieDomain = domain;
        
        /** @private {boolean} cookieSecure - only send over https */
        this.cookieSecure = (typeof secure !== 'boolean') ? false : secure;
        
        /** @private {string} cookieSamesite - same-site/cross-origin policy */
        this.cookieSamesite = (typeof sameSite !== 'string' || sameSite === '') ? 'Lax' : sameSite;

        /** @private {mixed} data - Cookie data (can be string, array or null) */
        this.data = this.fetchCookie();

        /** @private {boolean} _isEnabled - Stores isEnabled result */
        this._isEnabled = null;
    }
    
    /**
     * Get the cookie value (either a string, array or null)
     * @returns {mixed}
     */
     getCookie() {
        return this.data;
    }

    /**
     * Set the cookie value
     * @param {mixed} value 
     * @param {Date|string} expires Cookie expiration, either a Date object or a token string
     */
     setCookie(value, expires = '') {
        let cookieText = encodeURIComponent(this.cookieName) + '=' + encodeURIComponent(value);
        
        cookieText += '; expires=';
        if (expires instanceof Date) {
            cookieText += expires.toGMTString();
        } else {
            if (expires === '') expires = '1y'; // 1 year default
            cookieText += LmdCookie.calcExpiresDate(expires);
        }
        
        if (this.cookiePath) cookieText += '; path=' + this.cookiePath;
        if (this.cookieDomain) cookieText += '; domain=' + this.cookieDomain;
        if (this.cookieSecure) cookieText += '; secure';
        cookieText += '; SameSite=' + this.cookieSamesite;
        
        document.cookie = cookieText;
    }
    
    /**
     * Remove the cookie
     */
    removeCookie() {
        this.setCookie('', new Date(0));
    }
    
    /**
     * Fetch the cookie by name
     * @returns {mixed}
     */
     fetchCookie() {
        const cookies = document.cookie.split(/\s*;\s*/);
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].split('=');
            const key = decodeURIComponent(cookie[0]);
            const val = decodeURIComponent(cookie[1]);
            if (key === this.cookieName) {
                if (val.indexOf('|') >= 0) return val.split('|'); // array
                return val; // string
            }
        }
        return null; // doesn't exist
    }

    /**
     * Calculate an cookie expiration date from a token string
     * 
     * Token string format is a case-insenstive sequence of `nX` sparated by spaces, 
     * where 'n' is a number (integer) and 'X' a date token (e.g., 'Y' for years).
     * 
     * Valid Date Tokens:
     * 
     * - `Y` - Year ('`2Y`' = 2 years)
     * - `M` - Month ('`3M`' = 3 months)
     * - `D` - Days ('`5D`' = 5 days)
     * - `H` - Hours ('`6H`' = 6 hours)
     * - `Mi` - Minutes ('`30Mi`' = 30 minutes)
     * - `S` - Seconds ('`20s`' = 20 seconds)
     * - `W` - Weeks ('`2w`' = 2 weeks)
     * 
     * Example: '`1y 6m 12h`' = 1 year, 6 months and 12 hours 
     * 
     * @param {string} expires 
     * @returns string
     */
    static calcExpiresDate(expires) {
        const now = new Date();
        //console.log(`now : ${now}`);

        const tokens = expires.split(' ');

        for (let i = 0; i < tokens.length; i++) {
            let [match, num, tok] = tokens[i].match(/(\d+)(\w+)/i);

            tok = tok.toUpperCase();
            num = parseInt(num);

            switch (tok) {
                case 'Y':
                    now.setUTCFullYear(now.getUTCFullYear() + num);
                    break;
                case 'M':
                    now.setUTCMonth(now.getUTCMonth() + num);
                    break;
                case 'D':
                    now.setUTCDate(now.getUTCDate() + num);
                    break;
                case 'H':
                    now.setUTCHours(now.getUTCHours() + num);
                    break;
                case 'MI':
                    now.setUTCMinutes(now.getUTCMinutes() + num);
                    break;
                case 'S':
                    now.setUTCSeconds(now.getUTCSeconds() + num);
                    break;
                case 'W':
                    now.setUTCDate(now.getUTCDate() + (num * 7)); // 1 week = 7 days
                    break;
                default:
                    break;
            }
            
            //console.log(`${tok} + ${num} : ${now}`);
        }
        return  now.toGMTString();
    }
}