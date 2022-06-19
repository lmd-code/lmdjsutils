
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

In your script, initialise the class with the name of your store (required) and optional parameters.

```javascript
new LmdStorage(storeName, storeType, mapKey)
```

| Param | Type | Description |
| --- | --- | --- |
| `storeName` | string | *[Required]* If the storage item doesn't exist yet, it will be created when data is added. |
| `storeType` | string\|null | *[Optional]* Set 'local' for `localStorage` (*default*) and 'session' for `sessionStorage`. |
| `mapKey` | string | *[Optional]* Token to identify serialised `Map` objects. By default the token key '*_map*' is used - you only need to change it if clashes with a key in your own data. |

```javascript
// localStorage (you can actually omit the 'local' param)
const $myStorage = new LmdStorage('mystore', 'local'); 
const $myStorage = new LmdStorage('mystore');  // is equivalent to the above

// Specify sessionStorage
const $myStorage = new LmdStorage('mystore', 'session'); 

// You can have multiple stores, each one is a separate local storage entry, e.g.,:
const $userPrefs = new LmdStorage('userPrefs'); // user's website preferences
const $formData = new LmdStorage('formData'); // unfinished form data/blog posts/comments etc

// When setting a different mapKey, you can set storeType to 'null' to use the default
const $myStorage = new LmdStorage('mystore', null, '_mymapkey');
```

## Properties

### `isEnabled`

Save yourself a headache and check if local storage is available before you use it.

```javascript
console.log($myStorage.isEnabled); // returns boolean true/false
```

### `count`

Get number of items in your storage item.

```javascript
console.log($myStorage.count); // returns number
```

## Methods

### `setItem(key, value, noSave)`

Set a single item by key/value, optionally with a `noSave` flag.

| Param | Type | Description |
| --- | --- | --- |
| `key` | string | *[Required]* Item key. |
| `value` | mixed | *[Required]* Item value. |
| `noSave` | boolean | *[Optional]* Flag to prevent immediate automatic saving. |

**Note:** The optional `noSave` flag applies to all methods that modify the data and write to local storage. It prevents immediate automatic saving, which is useful for when you need to make lots of rapid changes (iterating a list of options for example) and only want to save (write) once. Just remember to call the `saveAll()` method (see [`saveAll()`](#saveallmapobject) below) to commit changes.

```javascript
$myStorage.setItem('foo', 'Hello World'); // save immediately

$myStorage.setItem('foo', 'Hello World', true); // with noSave flag
```

### `setItems({key1: value1, ...}, noSave)`

Set multiple values as an object, optionally with a `noSave` flag.

| Param | Type | Description |
| --- | --- | --- |
| `{key1: value1, ...}` | object | *[Required]* Item key/value pairs. |
| `noSave` | boolean | *[Optional]* Flag to prevent immediate automatic saving (see [setItem()](#setitemkey-value-nosave)). |

```javascript
$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}); // save immediately

$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}, true); // with noSave flag
```

### `getItem(key)`

Get a single item value by key (returns 'undefined' if the key doesn't exist).

| Param | Type | Description |
| --- | --- | --- |
| `key` | string | *[Required]* Item key. |

```javascript
console.log($myStorage.getItem('foo')); // returns string 'Hello World'

console.log($myStorage.getItem('bar')); // returns boolean 'true'

console.log($myStorage.getItem('baz')); // returns number '42'

console.log($myStorage.getItem('nope')); // return undefined
```

### `getItems()`

The `getItems()` method returns a copy of the internal data `Map` object. You can therefore do everything you can with `Map` objects.

However, it is a *deep copy* and not a reference, so if you update data directly on the returned `Map`, it *will not* update in local storage. You can save it back, however, by explicitly passing the `Map` object as a parameter to the `saveAll()` method.

Useful for if you want a working copy of the data and only want to update the storage under certain circumstances (some sort of user interaction, or example).

See [`getItems()` example code](#example-using-the-getitems-method) below.

```javascript
// Get all items as a Map object
let allPrefs = $myStorage.getItems();
```

### `removeItem(key, noSave)`

Remove a single item by key, optionally with a `noSave` flag.

| Param | Type | Description |
| --- | --- | --- |
| `key` | string | *[Required]* Item key. |
| `noSave` | boolean | *[Optional]* Flag to prevent immediate automatic saving (see [setItem()](#setitemkey-value-nosave)). |

```javascript
$myStorage.removeItem('bar'); // save immediately

$myStorage.removeItem('bar', true); // with noSave flag
```

### `removeItems(['key1', ...], noSave)`

Remove multple items by an array of keys, optionally with a `noSave` flag.

| Param | Type | Description |
| --- | --- | --- |
| `['key1', ...]` | array | *[Required]* Item keys. |
| `noSave` | boolean | *[Optional]* Flag to prevent immediate automatic saving (see [setItem()](#setitemkey-value-nosave)). |

```javascript
$myStorage.removeItems(['bar', 'baz']);

$myStorage.removeItems(['bar', 'baz'], true); // with noSave flag
```

### `saveAll(mapObject)`

Save all items - overwrites stored data with current state. Useful for when you make several changes using the `noSave` flag and want to save just once.

| Param | Type | Description |
| --- | --- | --- |
| `mapObj` | Map | *[Optional]* Optionally provide a new `Map` object, if you have been working on a separate copy of the data. |

```javascript
$myStorage.saveAll(); // Current data

$myStorage.saveAll(mapObject); // Pass a new Map object (replaces original data)
```

### `clearAll()`

Remove entire store - clears internal data and deletes from local storage.

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

// Write changes back to local storage (will replace data, not merge!)
$myStorage.saveAll(mydata);

// "Original" data:
console.log($myStorage.getItem('greet')); // 'Hello'
console.log($myStorage.getItem('where')); // 'Moon'
console.log($myStorage.getItem('status')); // undefined
```

## General Local Storage Notes

- Unlike cookies, local storage is only accessible within its own domain/sub-domain.  In other words, it is strictly scoped to the same-origin. The domains `example.com`, `www.example.com`, `foo.example.com`, as well as `https://example.com` (encryption enabled) and `http://example.com` do not have access to each other's local storage.
- Likewise, local storage is not accessible cross-site either -- `test.com` can not access local storage from `example.com`.
- However, a third-party script running within your site could still access your domain's local storage, so *do **not** use it to store sensitive data*.
