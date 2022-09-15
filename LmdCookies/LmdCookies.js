/**
 * LmdCookies - a lightweight wrapper for browser cookies
 * @copyright LMD-Code 2022
 * @see https://github.com/lmd-code/lmdjsutils/
 * @version 1.1.1
 * @license CC0-1.0
 */

'use strict';

/**
 * Wrapper class for interacting with browser cookies.
 */
class LmdCookies {
    /**
     * Initialise and fetch cookies.
     * 
     * @param {string|null} prefix - Prefix for cookie names (leave blank for no prefix)
     * @param {string|null} path - Path for cookie (default: null - uses curent path)
     * @param {string|null} domain - Cookie domain (default: null - uses current domain)
     * @param {boolean} secure - Only send over https (default: false)
     * @param {string} sameSite - Same-origin/cross-site policy (default: 'lax')
     */
    constructor(prefix = null, path = null, domain = null, secure = false, sameSite = 'lax') {
        /** @private {string} cookiePrefix */
        this.cookiePrefix = (typeof prefix === 'string' && prefix !== '') ? prefix + '_' : '';
        
        /** @private {string|null} cookiePath */
        this.cookiePath = (typeof path === 'string' && path !== '') ? path : null;
        
        /** @private {string|null} cookieDomain */
        this.cookieDomain = (typeof domain === 'string' && domain !== '') ? domain : null;
        
        /** @private {boolean} cookieSecure */
        this.cookieSecure = (typeof secure === 'boolean') ? secure : false;
        
        /** @private {string} cookieSamesite */
        this.cookieSamesite = (typeof sameSite === 'string' && sameSite !== '') ? sameSite : 'lax';

        /** @private {boolean} _isEnabled - Stores isEnabled result */
        this._isEnabled = null;
        
        /** @private {string} cookiePrefixEnc URI encoded prefix */
        this.cookiePrefixEnc = (this.cookiePrefix !== '') ? encodeURIComponent(prefix) + '_' : '';

        // If SameSite = 'none', then enforce secure = true
        if (this.cookieSamesite === 'none') {
            this.cookieSecure = true;
            console.warn(`${this.constructor.name}: where 'SameSite' is set to 'none' (cross-site access allowed), 'secure' must be set to 'true' (access over 'HTTPS' only), or it may be rejected by modern browsers. If the domain serving the cookie does not have HTTPS, then you can not specify 'none' for 'SameSite'.`);
        }

        /** @private {Object} data - All accessible cookies */
        this.data = this.getCookies();
    }
    
    /**
     * Detect if cookies are available/enabled in user's browser.
     * @property {boolean} isEnabled
     */
    get isEnabled() {
        if (this._isEnabled === undefined || this._isEnabled === null) {
            const testKey = '_lmdcookies_test';

            // Has a test cookie already been saved this session
            if (document.cookie.indexOf(testKey) != -1) {
                this._isEnabled = true;
            } else {
                try {
                    // Check if cookies enabled by the browser
                    if (!navigator.cookieEnabled) throw 'NO_COOKIE';

                    // Even if if enabled, do they work - set a test session cookie
                    document.cookie = testKey + '=LmdCookiesTest;SameSite=Strict';

                    // Check if it got stored by the browser
                    if (document.cookie.indexOf(testKey) == -1) throw 'NO_COOKIE';

                    // We have cookies
                    this._isEnabled = true;
                } catch (e) {
                    this._isEnabled = false;
                    console.warn(`${this.constructor.name}: Cookies are not available/enabled.`);
                }
            }
        }
        
        return this._isEnabled;
    }

    /**
     * Number of cookies retrieved.
     * When a prefix is used, only cookies using that prefix are counted.
     * @property {number} count
     */
    get count() {
        if (this.data === undefined || this.data === null) return 0;
        return Object.keys(this.data).length;
    }

    /**
     * Check whether a cookie name exists.
     * 
     * @param {string} name Cookie name
     * @returns {boolean}
     */
    has(name) {
        const cookieName = this.cookiePrefix + name;
        return (cookieName in this.data);
    }
    
    /**
     * Get the cookie value.
     * 
     * Returns `undefined` if cookie name does not exist.
     * 
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
     * Set/update the cookie value.
     * 
     * Expiration date can either be token string or a Date object.
     * @see {@link calcExpiresDate} for token string format.
     * 
     * @param {string} name Name of cookie to set/update (will create cookie if it does not exist)
     * @param {mixed} value Value to store in cookie (any JSON serialisable string)
     * @param {Date|string} expires Cookie expiration date (defaults to 'session' cookie)
     */
     set(name, value, expires = 'session') {
        try {
            // Use encoded cookie prefix
            let cookieText = this.cookiePrefixEnc + encodeURIComponent(name) + '=';

            cookieText += encodeURIComponent(JSON.stringify(value));

            if (expires !== 'session') {
                cookieText += '; expires=' + LmdCookies.calcExpiresDate(expires);
            }
            
            if (this.cookiePath) cookieText += '; path=' + this.cookiePath;
            if (this.cookieDomain) cookieText += '; domain=' + this.cookieDomain;
            if (this.cookieSecure) cookieText += '; secure';
            cookieText += '; samesite=' + this.cookieSamesite;
            
            document.cookie = cookieText;

            this.data = this.getCookies(); // refresh
        } catch (e) {
            console.error(`${this.constructor.name}: could not create/update '${name}'.\n${e.message}`);
        }
    }
    
    /**
     * Remove/delete a cookie
     * 
     * @param {string} name Name of cookie to remove
     */
    remove(name) {
        this.set(name, '', new Date(0));
    }
    
    /**
     * Get all accessible cookies.
     * 
     * When a prefix is provided, only cookies using that prefix will be returned.
     * 
     * @returns {Object}
     */
     getCookies() {
        const cookies = document.cookie.split(/\s*;\s*/).filter(item => item);
        let cookieJar = Object.create(null);

        if (Array.isArray(cookies) && cookies.length > 0) {
            for (const cookie of cookies) {
                // If a prefix is set, skip cookie if it doesn't match (use encoded prefix)
                if (this.cookiePrefixEnc !== '' && cookie.indexOf(this.cookiePrefixEnc) !== 0) continue; 

                const [key, val] = cookie.split('=').map((item) => decodeURIComponent(item));
                
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
     * Calculate an cookie expiration date from a date token string.
     * 
     * The date token string format is a *case-insensitive* sequence of 
     * digit/letter pairs, with each pair separated by a space.
     * 
     * For Example: `1y 6m 12h` = 1 year, 6 months and 12 hours.
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
        if (expires instanceof Date) return expires.toUTCString(); // already a Date object

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
        
        return  now.toUTCString();
    }
}