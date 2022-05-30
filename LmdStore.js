'use strict';

/**
 * Wrapper library for interacting with localStorage on an individual store level
 * 
 * @todo Refactor to use Map instead of object
 * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
 */
class LmdStore {
    /**
     * Initialise a store
     * @param {string} storeKey localStorage item key
     */
    constructor(storeKey) {
        /** @property {string} storeName Name (key) of localStorage item */
        this.storeName = storeKey;
        
        /** @property {object} data Data items in key/value pairs */
        this.data = this.getStore(storeKey);
    }

    /**
     * Number of items in store
     */
    get length() {
        if (this.data === null) return 0;
        return Object.keys(this.data).length;
    }
    
    /**
     * Get localStorage item, convert resulting JSON string into object and return
     * 
     * @returns object
     */
    getStore() {
        let jsonStr = localStorage.getItem(this.storeName);
        
        if (jsonStr) {
            let obj = JSON.parse(jsonStr);
        
            if (obj) {
                return obj;
            }
        }
        
        return {};
    }
    
    /**
     * Set localStorage item (creates/overwrites) after converting object back into JSON string
     */
    setStore() {
        let jsonStr = JSON.stringify(this.data);
        
        if (jsonStr) {
            localStorage.setItem(this.storeName, jsonStr);
        }
    }
    
    /**
     * Get value of individual data item by key
     * 
     * @param {string} key Stored data item key (object property)
     * @returns mixed|null
     */
    getItem(key) {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        }
        return null;
    }
    
    /**
     * Get all items at once.
     * 
     * Optionally return as a Map object instead of regular object.
     * 
     * @param {Boolean} asMap Set to `true` to return Map object (default `false`)
     */
    getItems(asMap) {
        if (!asMap) {
            return this.data; // the original data object
        }
        
        let data = new Map();
        for (const key in this.data) {
            if (this.data.hasOwnProperty(key)) {
                data.set(key, this.data[key]);
            }
        }
        return data; // iterable Map object
    }
    
    /**
     * Set value of individual data item by key
     * 
     * @param {string} key 
     * @param {mixed} val
     */
    setItem(key, val) {
        this.data[key] = val;
        this.setStore();
    }
    
    /**
     * Set values of multiple data items
     * 
     * @param {object} objData 
     */
    setItems(objData) {
        for (const prop in objData) {
            if (objData.hasOwnProperty(prop)) {
                this.data[prop] = objData[prop];
            }
        }
        this.setStore();
    }

    /**
     * Remove individual data item by key
     * 
     * @param {string} key 
     */
    removeItem(key) {
        if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
        }
        this.setStore();
    }

    /**
     * Remove multiple data items by key
     * 
     * @param {array} keys 
     */
    removeItems(keys) {
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (this.data.hasOwnProperty(key)) {
                delete this.data[key];
            }
        }
        this.setStore();
    }

    /**
     * Clear (remove) data store
     */
    clearAll() {
        localStorage.clear(this.storeName);
    }
}