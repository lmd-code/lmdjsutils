
# LmdStorage

---

**Note:** As with all scripts in this repository, I made this for my own small projects where dependency on a larger, more feature-rich, library would be overkill. Feel free to use if you think it's helpful for your projects.

---

Lightweight wrapper for `localStorage`. Use a single entry key in `localStorage` to store multiple values in key/value pairs.

Data is represented as a `Map` object which is serialised and stored as a JSON string. This allows stored values to be any valid JSON data type instead of just strings. You can even store other `Map` objects, they are serialised and restored safely, the only requirement is that item keys must always be a string to be valid JSON.

## Minimum Requirements

- ECMAScript 6 (ES6, aka ECMAScript 2015) capable browsers.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdStorage.min.js"></script>
<script src="path/to/your-script.js"></script>
```

Then in your script:

```javascript
/** your-script.js */

// Initialise with the name of your store to make ready to use.
// If it doesn't exist yet, it will be created when an item is added.
const $myStorage = new LmdStorage('mystore');

// You can have multiple stores, each one is a separate localStorage entry:
const $userPrefs = new LmdStorage('userPrefs'); // user's website preferences
const $formData = new LmdStorage('formData'); // unfinished form data/blog posts/comments etc

// Check localStorage is available in user's browser
const storageAvailable = $myStorage.isEnabled; // returns boolean true/false

// Get number of stored items
let numItems = $myStorage.count; // returns number

// Set or update a single item 
$myStorage.setItem('foo', 'Hello World'); // save immediately
$myStorage.setItem('foo', 'Hello World', true); // with noSave flag (see note #1)

// Set or update multiple items as an object
$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}); // save immediately
$myStorage.setItems({foo: 'Hello World', bar: true, baz: 42}, true); // with noSave flag

// Get a single item value by key (returns 'undefined' if the key doesn't exist)
let foo = $myStorage.getItem('foo'); // returns string 'Hello World'
let bar = $myStorage.getItem('bar'); // returns boolean 'true'
let baz = $myStorage.getItem('baz'); // returns number '42'

// Get all items as a Map object (see note #2)
let allPrefs = $myStorage.getItems();

// Remove an item by key
$myStorage.removeItem('bar'); // save immediately
$myStorage.removeItem('bar', true); // with noSave flag

// Remove multiple items by key (pass keys as an array)
$myStorage.removeItems(['bar', 'baz']);
$myStorage.removeItems(['bar', 'baz'], true); // with noSave flag

// Save all items - overwrites stored data with current state.
// Useful for when you make several changes using the noSave flag and want to save just once.
$myStorage.saveAll();
$myStorage.saveAll(mapObject); // Pass a new Map object (replaces original data)

// Remove entire store (clears internal data and deletes from localStorage)
$myStorage.clearAll();
```

### Note 1: `noSave` flag parameter

Methods that modify the data and write to `localStorage` have an optional `noSave` flag parameter (boolean) to prevent immediate automatic saving. Just remember to call the `saveAll()` method later to commit changes.

### Note 2: `getItems()` method

The `getItems()` method returns a copy of the internal data `Map` object. You can therefore do everything you can with `Map` objects.

However, it is a *deep copy* and not a reference, so if you update data directly on the returned `Map`, it *will not* update in `localStorage`. You can save it back, however, by explicitly passing the `Map` object as a parameter to the `saveAll()` method.

Useful for if you want a working copy of the data and only want to update the storage under certain circumstances (some sort of user interaction, or example).

```javascript

const $myStorage = new LmdStorage('mystore');

// Set some data
$myStorage.setItems({
    foo: 'Hello Earth',
    bar: 616
});

// Grab a copy as a Map object
let mydata = $myStorage.getItems();

// Iterate data
let out = '';

mydata.forEach((value, key) => {
    out += key + ': ' + value + '\n';
});

console.log('Your Data\n====================\n' + out);
/*
 * Your Data
 * ====================
 * foo: Hello Earth
 * bar: 616
 */

// Work on the copy, keeping the stored data intact

// Update
mydata.set('foo', 'Hello Moon');

console.log(mydata.get('foo')); // 'Hello Moon'
console.log($myStorage.getItem('foo')); // 'Hello Earth'

// Delete
mydata.delete('bar'); 

console.log(mydata.get('bar')); // undefined
console.log($myStorage.getItem('bar')); // 616

// Write changes back to storage (will replace data, not merge!)
$myStorage.saveAll(mydata);

console.log($myStorage.getItem('foo')); // 'Hello Moon'
console.log($myStorage.getItem('bar')); // undefined
```

## @TODO

- Work with both `localStorage` *and* `sessionStorage`.
