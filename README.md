# LMD-Code JS Utils

Small self-contained reusable Javascript utilities.

## LmdStore

Lightweight wrapper class for `localStorage`. Use a single localStorage item to store multiple values in key-value pairs.

Data is stored as JSON string, allowing any (valid JSON) variable type (not just strings) to be stored.

### Usage

Include the script in the `<head>` of your HTML document. Javascript classes must defined (inserted) before they are used.

```html
<script src="path/to/LmdStore.min.js"></script>
<script src="path/to/your-script.js"></script>
```

Then in your script:

```javascript
var $userPrefs = new LmdStore('userPrefs');

// Set or update an item
$lmdstore.setItem('theme', 'dark');

// Set or update multiple items as an object
$userPrefs.setItems({
    theme: 'dark',
    bigFont: true,
    numPages: 10
});

// Get an item
let theme = $userPrefs.getItem('theme'); // returns string 'dark'
let bigFont = $userPrefs.getItem('bigFont'); // returns boolean 'true'
let numPages = $userPrefs.getItem('numPages'); // returns integer '10'

// Get all items - two options
let allPrefs = $userPrefs.getItems(); // returns object
let allPrefs = $userPrefs.getItems(true); // returns iterable Map

// Remove an item
$userPrefs.removeItem('bigFont');

// Remove multiple items (item keys given as an array)
$userPrefs.removeItems(['bigFont', 'numPages']);

// Remove entire store
$userPrefs.clearAll();
// destroy $userPrefs object?

// Get number of stored items
let numItems = $userPrefs.length; // returns integer
```

