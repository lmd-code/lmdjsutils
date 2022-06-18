
# LmdStorage

---

**Note:** As with all scripts in this repository, I made this for my own small projects where dependency on a larger, more feature-rich, library would be overkill. Feel free to use if you think it's helpful for your projects.

---

Lightweight wrapper for local storage (`localStorage`/`sessionStorage`). Use a single local storage item to store multiple values in key/value pairs.

Data is represented as a `Map` object which is serialised and stored as a JSON string. This allows stored values to be any valid JSON data type instead of just strings. You can even store other `Map` objects, they are serialised and restored safely, the only requirement is that item keys must always be a string to be valid JSON.

## Minimum Requirements

- ECMAScript 6 (ES6, aka ECMAScript 2015) capable browsers.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdStorage.min.js"></script>
<script src="path/to/your-script.js"></script>
```

Then in your script, initialise the LmdStorage class with the name of your store and the type of storage to use ('local' or 'session').

```javascript
new LmdStorage(storeName, storeType, mapKey)
```

| Param | Type | Description |
| ----- | ---- | ----------- |
| `storeName` | string | |
| `storeType` | string | Optional. 'local' (default) for `localStorage`, 'session' for `sessionStorage`.|
| `mapKey` | string | Optional. Token to identify `Map` objects. Only needed to use it under *certain circumstances*. Serialised `Map` objects are indicated by the key '_map' -- if you think that this will clash with a key name in your own data, then you can change it to something else via this parameter. |

If the storage item doesn't exist yet, it will be created when an item is added.

```javascript
// localStorage (you can omit the 'local' param)
const $myStorage = new LmdStorage('mystore', 'local'); 

// sessionStorage
const $myStorage = new LmdStorage('mystore', 'session'); 

// You can have multiple stores, each one is a separate browser storage entry, e.g.,:
const $userPrefs = new LmdStorage('userPrefs'); // user's website preferences
const $formData = new LmdStorage('formData'); // unfinished form data/blog posts/comments etc

// When setting a different mapKey, the second parameter ('local' or 'session') is now required
const $myStorage = new LmdStorage('mystore', 'local', '_mymapkey');
```

## Properties

### `isEnabled`

Save yourself a headache and check if browser storage is available before you use it.

```javascript
const storageAvailable = $myStorage.isEnabled; // returns boolean true/false
```

### `count`

Get number of items in your storage item.

```javascript

let numItems = $myStorage.count; // returns number
```

## Methods

### `setItem(key, value, noSave) / setItems({key1: value1, key2: value2}, noSave)`

Set a single item by key/value or multiple values as an object, optionally with a `noSave` flag.

The optional `noSave` flag parameter (boolean) applies to all methods that modify the data and write to browser storage. It prevents immediate automatic saving, which is useful for when you need to make lots of rapid changes (iterating a list of options for example) and only want to save (write) once. Just remember to call the `saveAll()` method (see [`saveAll()`](#saveallmapobject) below) to commit changes.

```javascript
// Set or update a single item 
$myStorage.setItem('foo', 'Hello World'); // save immediately
$myStorage.setItem('foo', 'Hello World', true); // with noSave flag

// Set or update multiple items as an object
$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}); // save immediately
$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}, true); // with noSave flag
```

### `getItem(key)`

Get a single item value by key (returns 'undefined' if the key doesn't exist).

```javascript
// Using the items we set above
let foo = $myStorage.getItem('foo'); // returns string 'Hello World'
let bar = $myStorage.getItem('bar'); // returns boolean 'true'
let baz = $myStorage.getItem('baz'); // returns number '42'
let hey = $myStorage.getItem('hey'); // return undefined
```

### `getItems()`

The `getItems()` method returns a copy of the internal data `Map` object. You can therefore do everything you can with `Map` objects.

However, it is a *deep copy* and not a reference, so if you update data directly on the returned `Map`, it *will not* update in browser storage. You can save it back, however, by explicitly passing the `Map` object as a parameter to the `saveAll()` method.

Useful for if you want a working copy of the data and only want to update the storage under certain circumstances (some sort of user interaction, or example).

See [`getItems()` example code](#example-using-the-getitems-method) below.

```javascript
// Get all items as a Map object
let allPrefs = $myStorage.getItems();
```

### `removeItem(key, noSave) / removeItems(['key1', 'key2'], noSave)`

Remove a single item by key or multple items by an array of keys, optionally with a `noSave` flag (see [setItem()/setItems()](#removeitemkey-nosave--removeitemskey1-key2-nosave)).

```javascript
// Single Item
$myStorage.removeItem('bar'); // save immediately
$myStorage.removeItem('bar', true); // with noSave flag

// Multiple items
$myStorage.removeItems(['bar', 'baz']);
$myStorage.removeItems(['bar', 'baz'], true); // with noSave flag
```

### `saveAll(mapObject)`

Save all items - overwrites stored data with current state. Useful for when you make several changes using the `noSave` flag and want to save just once.

You can optionally provide a new `Map` object, if you have been working on a separate copy of the data.

```javascript
$myStorage.saveAll(); // Current data
$myStorage.saveAll(mapObject); // Pass a new Map object (replaces original data)
```

### `clearAll()`

Remove entire store - clears internal data and deletes from browser storage.

```javascript
$myStorage.clearAll();
```

## Example using the `getItems()` method

The `getItems()` method returns a copy of the internal data `Map` object.

```javascript
// Initialise a localStorage item
const $myStorage = new LmdStorage('mystore');

// Set some data
$myStorage.setItems({
    greet: 'Hello',
    where: 'Earth',
    status: 'I live here!'
});

// Grab a copy as a Map object
let mydata = $myStorage.getItems();

// Iterate Map object
let out = '';

mydata.forEach((value, key) => {
    out += key + ': ' + value + '\n';
});

console.log('Your Data\n====================\n' + out);
/*
 * Your Data
 * ====================
 * greet: Hello
 * where: Earth
 * status: I live here!
 */

// Work on the copy, keeping the stored data intact

// Update copy
mydata.set('where', 'Moon');

console.log(mydata.get('where')); // Copy: 'Moon'
console.log($myStorage.getItem('where')); // Original: 'Earth'

// Delete from copy
mydata.delete('status'); 

console.log(mydata.get('status')); // Copy: undefined
console.log($myStorage.getItem('status')); // Original: 'I live here!'

// Write changes back to browser storage (will replace data, not merge!)
$myStorage.saveAll(mydata);

// "Original" data:
console.log($myStorage.getItem('greet')); // 'Hello'
console.log($myStorage.getItem('where')); // 'Moon'
console.log($myStorage.getItem('status')); // undefined
```

## General Local Storage Notes

You probably know this, but just in case:

- Unlike cookies, local storage is only accessible within its own domain/sub-domain.  In other words, it is strictly scoped to the same-origin. The domains `example.com`, `www.example.com`, `foo.example.com`, as well as `https://example.com` (encryption enabled) and `http://example.com` do not have access to each other's local storage.
- Likewise, local storage is not accessible cross-site either -- `test.com` can not access local storage from `example.com`.
- However, a third-party script running within your site could still access your domain's local storage, so *do **not** use it to store sensitive data*.
