/**
 * LmdStorage - a lightweight wrapper for local browser storage
 * @copyright LMD-Code 2022
 * @see https://github.com/lmd-code/lmdcode-js-utils/
 * @version 1.4.2
 * @license GPLv3 
 */

'use strict';

/**
 * Wrapper class for interacting with browser storage (localStorage/sessionStorage).
 */
class LmdStorage {
    /**
     * Initialise a store
     * @param {string} storeKey - Name (key) of browser storage item
     * @param {string|null} storeType - Type of browser storage to use, 'local' (default) or 'session'
     * @param {string} mapKey - Optional key for identifying Maps when data is serialised, 
     *                          helps with converting to and from JSON
     */
    constructor(storeKey, storeType = 'local', mapKey = '_map') {
        /** @private {string} storeName - Storage item key */
        this.storeName = storeKey;

        /** @private {string} storeType - Type of storage ('local' or 'session') */
        this.storageType = 'local'; // default localStorage
        if (typeof storeType === 'string' && storeType === 'session') {
            this.storageType = 'session'; // use sessionStorage instead
        }
        
        /** @private {string} mapKey - Key for identifying Map objects when stringified as JSON */
        this.mapKey = (typeof mapKey === 'string' && mapKey !== '') ? mapKey : '_map';

        /** @private {Map} data - Data items in key/value pairs */
        this.data = this.getStore();

        /** @private {boolean} _isEnabled - Stores isEnabled result */
        this._isEnabled = null;
    }

    /**
     * Detect if browser storage is available in user's browser
     * @property {boolean} isEnabled
     */
    get isEnabled() {
        if (this._isEnabled === undefined || this._isEnabled === null) {
            const testKey = '_lmdstorage_test';
            const testValue = 'LmdStorage Test';

            try {
                if (this.storageType === 'session') {
                    sessionStorage.setItem(testKey, testValue);
                    if (sessionStorage.getItem(testKey) === testValue) {
                        sessionStorage.removeItem(testKey);
                        this._isEnabled = true;
                    } else {
                        this._isEnabled = false;
                    }
                } else {
                    localStorage.setItem(testKey, testValue);
                    if (localStorage.getItem(testKey) === testValue) {
                        localStorage.removeItem(testKey);
                        this._isEnabled = true;
                    } else {
                        this._isEnabled = false;
                    }
                }
            } catch (e) {
                this._isEnabled = false;
            }
        }

        return this._isEnabled;
    }

    /**
     * @property {number} count - Number of stored items
     */
    get count() {
        if (this.data === undefined || this.data === null) return 0;
        return this.data.size;
    }

    /**
     * Get value of individual data item by key
     * @param {string} key - Stored data item key
     * @returns {*} - Item value
     */
    getItem(key) {
        return this.data.get(key);
    }

    /**
     * Get entire Map object (deep copy)
     * @returns {Map} - Stored data
     */
    getItems() {
        return this.mapify(this.jsonify(this.data));
    }

    /**
     * Set value of individual data item by key
     * @param {string} key - Item key
     * @param {*} val - Item value
     * @param {boolean} noSave - Optional flag to prevent auto saving (default: false)
     */
    setItem(key, val, noSave = false) {
        this.data.set(key, val);
        if (!noSave) {
            this.setStore();
        }
    }

    /**
     * Set values of multiple data items
     * @param {Object} objData - Item key/value pairs
     * @param {boolean} noSave - Optional flag to prevent auto saving (default: false)
     */
    setItems(objData, noSave = false) {
        let setCount = 0;

        for (const prop in objData) {
            if (objData.hasOwnProperty(prop)) {
                this.data.set(prop, objData[prop]);
                setCount++;
            }
        }

        if (setCount > 0 && !noSave) {
            this.setStore(); // only save if item has been added
        }
    }

    /**
     * Remove individual data item by key
     * @param {string} key - Item key
     * @param {boolean} noSave - Optional flag to prevent auto saving (default: false)
     */
    removeItem(key, noSave = false) {
        if (this.data.delete(key) && !noSave) {
            this.setStore(); // only save if successful
        }
    }

    /**
     * Remove multiple data items by key
     * @param {Array} keys - Item keys
     * @param {boolean} noSave - Optional flag to prevent auto saving (default: false)
     */
    removeItems(keys, noSave = false) {
        let delCount = 0;

        for (let i = 0; i < keys.length; i++) {
            if (this.data.delete(keys[i])) {
                delCount++;
            }
        }

        if (delCount > 0 && !noSave) {
            this.setStore(); // only save if item has been deleted
        }
    }

    /**
     * Save entire data store, refresh data
     * @param {Map} mapObj - Map object to overwrite data (replace, not merge)
     */
    saveAll(mapObj = null) {
        // Overwrite Map object if param provided
        if (mapObj !== null && mapObj instanceof Map) {
            this.data.clear();
            for (const [key, value] of mapObj) {
                this.data.set(key, value);
            }
        }
        this.setStore();
        this.getStore();
    }

    /**
     * Clear (remove) storage item
     */
    clearAll() {
        this.data.clear(); // clear Map object
        try {
            if (this.storageType === 'session') {
                sessionStorage.clear(this.storeName); // remove sessionStorage item
            } else {
                localStorage.clear(this.storeName); // remove localStorage item
            }
        } catch (e) {
            console.warn('Could not clear stored data.')
        }
    }

    /**
     * Get storage item, then convert JSON string into Map
     * @private
     * @returns {Map} - Stored data
     */
     getStore() {
        let savedData;
        try {
            if (this.storageType === 'session') {
                savedData = sessionStorage.getItem(this.storeName);
            } else {
                savedData = localStorage.getItem(this.storeName);
            }
        } catch (e) {
            console.warn('Could not get saved data, a blank store has been created.');
        }
       return this.mapify(savedData);
    }

    /**
     * Set storage item after converting Map back into JSON string
     * @private
     */
    setStore() {
        try {
            if (this.storageType === 'session') {
                sessionStorage.setItem(this.storeName, this.jsonify(this.data));
            } else {
                localStorage.setItem(this.storeName, this.jsonify(this.data));
            }
        } catch (e) {
            console.warn("Could not save data.");
        }
    }

    /**
     * Convert Map object to JSON string
     * @private
     * @param {Map} mapObj - Map object
     * @returns {string} - JSON string
     */
    jsonify(mapObj) {
        if (mapObj instanceof Map) {
            try {
                const jsonStr = JSON.stringify(mapObj, (key, value) => {
                    if (value instanceof Map) return {[this.mapKey]: Array.from(value.entries())};
                    return value;
                });
                if (jsonStr !== undefined) return jsonStr;
            } catch (e) {
                console.warn('Could not create JSON string.');
            }
        } 
        return '{}'; // empty JSON string
    }

    /**
     * Convert JSON string to Map object
     * @private
     * @param {string} jsonStr - JSON string
     * @returns {Map} - Map object
     */
    mapify(jsonStr) {
        if (jsonStr !== undefined && jsonStr !== null && jsonStr !== '') {
            try {
                const mapObj = JSON.parse(jsonStr, (key, value) => {
                    if (typeof value === 'object' && value !== null) {
                        if (value.hasOwnProperty(this.mapKey)) return new Map(value[this.mapKey]);
                    }
                    return value;
                });
                if (mapObj instanceof Map) return mapObj; // only return if it is a Map
            } catch (e) {
                console.warn('Could not parse JSON string.');
            }
        }
        return new Map(); // empty Map
    }
}
