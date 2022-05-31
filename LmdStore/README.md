
# LmdStore

Lightweight wrapper for `localStorage`. Use a single entry in localStorage to store multiple values in key-value pairs.

Internally data is represented as a Map object, which is serialised and stored as a JSON string, allowing any (valid JSON) variable type (not just strings) to be stored. You can even store Map objects, they are converted and restored safely, the only requirement is that the key must always be a string to be valid JSON.

## Minimum Requirements

- Uses ES6 features, so will break in browsers that don't implement ES6 yet.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdStore.min.js"></script>
<script src="path/to/your-script.js"></script>
```

Then in your script:

```javascript
/** your-script.js */

// Initialise with the name of your store to make ready to use
var $userPrefs = new LmdStore('userPrefs');

// You can have multiple stores if it makes sense to
// var $userFaves = new LmdStore('userFaves');

// Set or update an item (if the store doesn't exist yet, 
// it will be created when the first item is added)
$userPrefs.setItem('theme', 'dark'); // save immediately
$userPrefs.setItem('theme', 'dark', 1); // with noSave flag (see note)

// Set or update multiple items as an object
$userPrefs.setItems({
    theme: 'dark',
    showGrid: true,
    numPages: 10
}); // save immediately

$userPrefs.setItems({
    theme: 'dark',
    showGrid: true,
    numPages: 10
}, 1); // with noSave flag

// Get an item
let theme = $userPrefs.getItem('theme'); // returns string 'dark'
let showGrid = $userPrefs.getItem('showGrid'); // returns boolean 'true'
let numPages = $userPrefs.getItem('numPages'); // returns integer '10'

// Get all items as a Map object (see note below)
let allPrefs = $userPrefs.getItems();

// Remove an item
$userPrefs.removeItem('showGrid'); // save immediately
$userPrefs.removeItem('showGrid', 1); // with noSave flag

// Remove multiple items (item keys given as an array)
$userPrefs.removeItems(['showGrid', 'numPages']);
$userPrefs.removeItems(['showGrid', 'numPages'], 1); // with noSave flag

// Save all items - overwrites stored data with current state.
// Useful for when you make several changes, using the noSave flag, 
// and want to save just once at the end.
$userPrefs.saveAll();

// Remove entire store (clears internal data and deletes from localStorage)
$userPrefs.clearAll();

// Get number of stored items
let numItems = $userPrefs.count; // returns integer
```

### A note on the `noSave` flag

Methods that modify the data and write to `localStorage` have an optional `noSave` flag parameter (pass a truthy value) to prevent immediate automatic saving. Just remember to call the `saveAll()` method later.

### A note on `getItems()`

The `getItems()` method returns a copy of the internal data Map object. You can therefore do everything you can with Map objects.

However, it is a clone and not a reference, so if you update data directly on the returned Map, it *will not* update in `localStorage` by calling `saveAll()`.
