/**
 * LmdStore - wrapper for interacting with localStorage
 * @author LMD-Code
 * @version 1.0.0
 */

 'use strict';

 /**
  * Wrapper class for interacting with localStorage on an individual store level
  */
 class LmdStore {
     /**
      * Initialise a store
      * @param {string} storeKey - localStorage item key
      * @param {string} mapKey   - (Optional) Key for identifying Maps when data is stringified, 
      *                            helps with converting to and from JSON
      */
     constructor(storeKey, mapKey = '_map') {
         /** @property {string} storeName - Name (key) of localStorage item */
         this.storeName = storeKey;
         
         /** @property {string} mapKey - Key for identifying Map objects when stringified as JSON */
         this.mapKey = mapKey;
 
         /** @property {Map} data - Data items in key/value pairs */
         this.data = this.getStore(storeKey);
     }
 
     /**
      * Number of stored items
      * @return {number} Number of items
      */
     get count() {
         if (this.data === null) return 0;
         return this.data.size;
     }
     
     /**
      * Get localStorage item, then convert JSON string into Map
      * @return {Map} Stored data
      */
     getStore() {
         let jsonStr = localStorage.getItem(this.storeName);
         
         if (jsonStr !== null) {
             try {
                 let data = JSON.parse(jsonStr, (key, value) => {
                     if (typeof value === 'object' && value !== null) {
                         if (value.hasOwnProperty(this.mapKey)) return new Map(value[this.mapKey]);
                     }
                     return value;
                 });
 
                 return data;
             } catch (e) {
                 console.error(e.message);
             }
         }
         
         return new Map();
     }
     
     /**
      * Set localStorage item after converting Map back into JSON string
      */
     setStore() {
         try {
             let jsonStr = JSON.stringify(this.data, (key, value) => {
                 if(value instanceof Map) return {[this.mapKey]: Array.from(value.entries())};
                 return value;
             });
             
             if (typeof jsonStr !== 'undefined') {
                 localStorage.setItem(this.storeName, jsonStr);
             }
         } catch (e) {
             console.error(e.message);
         }
     }
     
     /**
      * Get value of individual data item by key
      * @param {string} key Stored data item key
      * @returns {*} Item value or null
      */
     getItem(key) {
         if (this.data.has(key)) {
             return this.data.get(key);
         }
         return null;
     }
     
     /**
      * Get entire Map object
      * @return {Map} Stored data
      */
     getItems() {
         return this.data;
     }
     
     /**
      * Set value of individual data item by key
      * @param {string} key Item key
      * @param {*} val Item value
      */
     setItem(key, val) {
         this.data.set(key, val);
         this.setStore();
     }
     
     /**
      * Set values of multiple data items
      * @param {Object} objData Item key/value pairs
      */
     setItems(objData) {
         let setCount = 0;
 
         for (const prop in objData) {
             if (objData.hasOwnProperty(prop)) {
                 this.data.set(prop, objData[prop]);
                 setCount++;
             }
         }
 
         if (setCount > 0) {
             this.setStore(); // only save if item has been added
         }
     }
 
     /**
      * Remove individual data item by key
      * @param {string} key Item key
      */
     removeItem(key) {
         if (this.data.delete(key)) {
             this.setStore(); // only save if successful
         }
     }
 
     /**
      * Remove multiple data items by key
      * @param {array} keys Item keys
      */
     removeItems(keys) {
         let delCount = 0;
 
         for (let i = 0; i < keys.length; i++) {
             if (this.data.delete(keys[i])) {
                 delCount++;
             }
         }
 
         if (delCount > 0) {
             this.setStore(); // only save if item has been deleted
         }
     }
 
     /**
      * Clear (remove) data store
      */
     clearAll() {
         this.data.clear(); // clear Map
         localStorage.clear(this.storeName); // remove localStore entry
     }
 }