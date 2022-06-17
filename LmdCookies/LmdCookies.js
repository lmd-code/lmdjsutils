/**
 * LmdCookies - a lightweight browser cookie wrapper
 * @copyright LMD-Code 2022
 * @see https://github.com/lmd-code/lmdcode-js-utils/
 * @version 0.3.0 - alpha
 * @license GPLv3 
 */

'use strict';

/**
 * Wrapper class for interacting with browser cookies
 * @class
 * 
 * @todo Determine if cookies are enabled/available in browser and provide warning if not.
 * @todo Override global cookie settings (path/domain/secure etc) on a per-cookie basis.
 * @todo Session cookies?
 */
class LmdCookies {
    /**
     * Initialise cookies
     * @param {string} prefix - Prefix for cookie names (will ignore any cookie not set with prefix)
     * @param {string|null} path - path for cookie (default: null)
     * @param {string|null} domain - cookie domain (default: null)
     * @param {boolean} secure - only send over https (default: false)
     * @param {string} sameSite - same-origin/cross-site policy (default: 'Lax')
     * expires
     */
    constructor(prefix = '', path = null, domain = null, secure = false, sameSite = 'Lax') {
        /** @private {string} cookiePrefix */
        this.cookiePrefix = (typeof prefix === 'string' && prefix !== '') ? prefix + '_' : '';
        
        /** @private {string|null} cookiePath */
        this.cookiePath = path;
        
        /** @private {string|null} cookieDomain */
        this.cookieDomain = domain;
        
        /** @private {boolean} cookieSecure */
        this.cookieSecure = (typeof secure === 'boolean') ? secure : false;
        
        /** @private {string} cookieSamesite */
        this.cookieSamesite = (typeof sameSite === 'string' && sameSite !== '') ? sameSite : 'Lax';

        /** @private {boolean} _isEnabled - Stores isEnabled result */
        this._isEnabled = null;

        /** @private {RegExp} prefixRegex - Regular expression to match prefixed names */
        this.prefixRegex = new RegExp('^' + this.cookiePrefix);

        /** @private {Object} data - All accessible cookies */
        this.data = this.getCookies();
    }
    
    /**
     * Detect if cookies are available/enabled in user's browser
     * @property {boolean} isEnabled
     */
    get isEnabled() {
        if (this._isEnabled === undefined || this._isEnabled === null) {
            const testKey = '_lmdcookies_test';
            try {
                if (navigator.cookieEnabled) {
                    document.cookie = testKey + '=LmdCookiesTest;Max-Age=60;SameSite=Strict';
                    if (document.cookie.indexOf(testKey) != -1) {
                        this._isEnabled = true;
                        document.cookie = testKey + '=;Max-Age=-1;SameSite=Strict';
                    } else {
                        this._isEnabled = false;
                    }
                } else {
                    this._isEnabled = false;
                }
            } catch (e) {
                this._isEnabled = false;
            }
        }
        
        return this._isEnabled;
    }
    
    /**
     * Get the cookie value (returns undefined if cookie name does not exist)
     * @param {string} name Cookie name
     * @returns {mixed}
     */
    get(name) {
        const cookieName = this.cookiePrefix + name;
        if (cookieName in this.data) {
            return this.data[cookieName];
        }
        return; // undefined
    }

    /**
     * Set/update the cookie value
     * 
     * Expiration date can either be token string or a Date object.
     * @see {@link calcExpiresDate} for token string format.
     * 
     * @param {string} name Name of cookie to set/update (will create cookie if it does not exist)
     * @param {mixed} value Value to store in cookie (any JSON serialisable string)
     * @param {Date|string} expires Cookie expiration date (defaults to 1 year)
     */
     set(name, value, expires = '') {
        try {
            let cookieText = encodeURIComponent(this.cookiePrefix + name) + '=';

            cookieText += encodeURIComponent(JSON.stringify(value));

            cookieText += '; expires=';
            if (expires instanceof Date) {
                cookieText += expires.toGMTString();
            } else {
                cookieText += LmdCookies.calcExpiresDate(expires);
            }
            
            if (this.cookiePath) cookieText += '; path=' + this.cookiePath;
            if (this.cookieDomain) cookieText += '; domain=' + this.cookieDomain;
            if (this.cookieSecure) cookieText += '; secure';
            cookieText += '; SameSite=' + this.cookieSamesite;
            
            document.cookie = cookieText;

            this.data = this.getCookies(); // refresh
        } catch (e) {
            console.error(`${this.constructor.name}: could not create/update '${name}'.\n${e.message}`);
        }
    }
    
    /**
     * Remove a cookie
     * 
     * @param {string} name Name of cookie to remove
     */
    remove(name) {
        this.setCookie(name, '', new Date(0));
    }
    
    /**
     * Get all accessible cookies
     * @returns {Object}
     */
     getCookies() {
        const cookies = document.cookie.split(/\s*;\s*/).filter(item => item);
        let cookieJar = Object.create(null);
        if (Array.isArray(cookies) && cookies.length > 0) {
            for (const cookie of cookies) {
                const [key, val] = cookie.split('=').map((item) => decodeURIComponent(item));

                if (this.prefixIsSet() && !this.prefixRegex.test(key)) {
                    continue; // skip cookie if it doesn't have a prefix
                }
                
                try {
                    cookieJar[key] = JSON.parse(val);
                } catch (e) {
                    console.error(`${this.constructor.name}: could not get value of '${key}'.\n${e.message}`);
                    cookieJar[key] = null;
                }
            }
        }
        return cookieJar;
    }
    
    /**
     * Is the cookie prefix set?
     * @returns boolean
     */
    prefixIsSet() {
        return this.cookiePrefix !== '';
    }

    /**
     * Calculate an cookie expiration date from a date token string
     * 
     * The date token string format is a *case-insensitive* sequence of 
     * digit/letter pairs, with each pair separated by a space.
     * 
     * For Example: `1y 6m 12h` = 1 year, 6 months and 12 hours 
     * 
     * Date Tokens:
     * 
     * - `Y` - Year (`2y` = 2 years)
     * - `M` - Month (`3m` = 3 months)
     * - `D` - Days (`5d` = 5 days)
     * - `H` - Hours (`6h` = 6 hours)
     * - `Mi` - Minutes (`30mi` = 30 minutes, note the two-letter code)
     * - `S` - Seconds (`20s` = 20 seconds)
     * - `W` - Weeks (`2w` = 2 weeks)
     * 
     * @param {string} expires 
     * @returns string
     */
    static calcExpiresDate(expires) {
        const now = new Date();

        const tokens = expires.split(/\s+/).filter(val => val);

        if (Array.isArray(tokens) && tokens.length > 0) {
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
            }
        } else {
            now.setUTCFullYear(now.getUTCFullYear() + 1); // 1 year default
        }
        
        return  now.toGMTString();
    }
}