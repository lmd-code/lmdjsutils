/**
 * @file LmdStorage - a lightweight localStorage wrapper
 * @author LMD-Code
 * @see https://github.com/lmd-code/lmdcode-js-utils
 * @version 1.3.0
 */

'use strict';

/**
 * Wrapper class for interacting with localStorage on an individual store level
 */
class LmdStorage {
    /**
     * Initialise a store
     * @param {string} storeKey - localStorage item key
     * @param {string} mapKey - Optional key for identifying Maps when data is stringified, 
     *                          helps with converting to and from JSON
     */
    constructor(storeKey, mapKey = '_map') {
        /** @property {string} storeName - Name (key) of localStorage item */
        this.storeName = storeKey;
        
        /** @property {string} mapKey - Key for identifying Map objects when stringified as JSON */
        this.mapKey = mapKey;

        /** @property {Map} data - Data items in key/value pairs */
        this.data = this.getStore();
    }

    /**
     * Number of stored items
     * @returns {number} - Number of items
     */
    get count() {
        if (this.data === undefined || this.data === null) return 0;
        return this.data.size;
    }
    
    /**
     * Detect if localStorage is available in browser
     * @returns {boolean}
     */
    isAvailable() {
        if (typeof Storage === "undefined") return false;

        try {
            const testKey = '_lmdstorage_test';
            const testValue = 'LmdStorage Test';
            
            localStorage.setItem(testKey, testValue);
            
            if (localStorage.getItem(testKey) === testValue) {
                localStorage.removeItem(testKey);
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        
        return false;
    }


    /**
     * Get localStorage item, then convert JSON string into Map
     * @returns {Map} - Stored data
     */
    getStore() {
        return this.mapify(localStorage.getItem(this.storeName));
    }
    
    /**
     * Set localStorage item after converting Map back into JSON string
     */
    setStore() {
        try {
            localStorage.setItem(this.storeName, this.jsonify(this.data));
        } catch (e) {
            console.error(e.message);
        }
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
     * Clear (remove) data store
     */
    clearAll() {
        this.data.clear(); // clear Map object
        localStorage.clear(this.storeName); // remove localStore entry
    }

    /**
     * Convert Map object to JSON string
     * @param {Map} mapObj - Map object
     * @returns {string} - JSON string
     */
    jsonify(mapObj) {
        if (mapObj instanceof Map) {
            try {
                let jsonStr = JSON.stringify(mapObj, (key, value) => {
                    if (value instanceof Map) return {[this.mapKey]: Array.from(value.entries())};
                    return value;
                });
                if (jsonStr !== undefined) return jsonStr;
            } catch (e) {
                console.error(e.message);
            }
        } 
        return '{}'; // empty JSON string
    }

    /**
     * Convert JSON string to Map object
     * @param {string} jsonStr - JSON string
     * @returns {Map} - Map object
     */
    mapify(jsonStr) {
        try {
            let mapObj = JSON.parse(jsonStr, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (value.hasOwnProperty(this.mapKey)) return new Map(value[this.mapKey]);
                }
                return value;
            });
            if (mapObj instanceof Map) return mapObj; // only return if it is a Map
        } catch (e) {
            console.error(e.message);
        }
        return new Map(); // empty Map
    }
}
