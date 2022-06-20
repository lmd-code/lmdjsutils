# LmdCookies

A lightweight wrapper for interacting with browser cookies.

Data is serialised as a JSON string, allowing stored values to maintain their 'type' (string, number, boolean, array, etc) and not be returned as a string by default (values must be a valid JSON data type).

## Minimum Requirements

- ECMAScript 6 (ES6, aka ECMAScript 2015) capable browsers.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdCookies.min.js"></script>
<script src="path/to/your-script.js"></script>
```

In your script, initialise the class with optional parameters.

```javascript
new LmdCookies(prefix, path, domain, secure, sameSite)
```

| Param | Type | Description |
| --- | --- | --- |
| `prefix` | string\|null | *[Optional]* Prefix for cookie names. When specified, any cookie without the prefix will be ignored (*defaults to no prefix/empty string*). |
| `path` |  string\|null | *[Optional]* Absolute path for cookie visibility (*defaults to current path*). |
| `domain` | string\|null | *[Optional]* Cookie domain (*defaults to current domain*). |
| `secure` | boolean | *[Optional]* Only send over HTTPS (*defaults to `false`*). |
| `sameSite` | string | *[Optional]* Same-origin/cross-site policy: 'lax' (*default*), 'strict' or 'none'. |

```javascript
// Basic - defaults only
$myCookies = new LmdCookies();

// Names prefixed by 'foo', accessible from any path from root directory, from any sub-domain
$myCookies = new LmdCookies('foo', '/', 'example.com');

// Allow secure (HTTPS) cross-site cookie
$myCookies = new LmdCookies(null, null, null, true, 'none');
```

## Properties

### `isEnabled`

Save yourself a headache and check if browser cookies are available before you use them.

```javascript
console.log($myCookies.isEnabled); // returns boolean true/false
```

### `count`

Get number of cookies retrieved.

**Note:** if using a prefix, only cookies using that prefix are retrieved and, therefore, counted.

```javascript

console.log($myCookies.count); // returns number
```

## Methods

### `set(name, value, expires)`

Set cookie data with optional expiration date (the default creates a 'session' cookie).

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | *[Required]* Name of the cookie to set/update, it will create the cookie if it does not exist. |
| `value` | mixed | *[Required]* Cookie value can be any value that can be serialised into a JSON string. |
| `expires` | string\|Date | *[Optional]* Cookie expiration date can be a date token string (see [Token Format](#token-format) below) or a `Date` object (*defaults to 'session' cookie*). |

```javascript
// Expire at the end of the session (default)
$myCookies.set('greeting', 'Hello World');

// Expire after elapsed time
$myCookies.set('greeting', 'Hello World', '1y 6m'); // 1 year, 6 months

// Expire on specified date/time
$myCookies.set('greeting', 'Hello World', new Date('2025-06-20 11:00:00'));

// Other data types:

$myCookies.set('foo', 42); // number (integer)

$myCookies.set('bar', ['Mercury', 'Venus', 'Earth']); // array

$myCookies.set('baz', true); // boolean
```

#### Token Format

The date token string format is a *case-insensitive* sequence of digit/letter pairs, with each pair separated by a space.

For Example: `1y 6m 12h` = 1 year, 6 months and 12 hours.

| Token | Timespan | Example |
| :---: | :------- | :------ |
| `Y` | Year | `2y` = 2 years |
| `M` | Month | `3m` = 3 months |
| `D` | Days | `5d` = 5 days |
| `H` | Hours | `6h` = 6 hours |
| `Mi` | Minutes | `30mi` = 30 minutes (note the two-letter code) |
| `S` | Seconds | `20s` = 20 seconds |
| `W` | Weeks | `2w` = 2 weeks |

### `has(name)`

Check whether a cookie exists.

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | *[Required]* Name of the cookie to check. |

```javascript
console.log($myCookies.has('greeting')); // returns true

console.log($myCookies.has('nope')); // returns false
```

### `get(name)`

Get cookie data - returns either a string or an array, or null if the cookie name doesn't exist.

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | *[Required]* Name of the cookie to get. Will return `undefined` if the cookie does not exist. |

```javascript
console.log($myCookies.get('greeting')); // returns string 'Hello World'

console.log($myCookies.get('foo')); // returns number 42 

console.log($myCookies.get('bar')); // returns array('Mercury', 'Venus', 'Earth')

console.log($myCookies.get('baz')); // return boolean true

console.log($myCookies.get('nope')); // returns undefined
```

### `remove(name)`

Remove/delete cookie from browser.

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | *[Required]* Name of the cookie to remove/delete. |

```javascript
$myCookies.remove('greeting');

console.log($myCookies.get('greeting')); // returns undefined
```

## General Cookie Notes

- You can only have a total of ~20 cookies per domain (depending on the browser), storing up to a maximum of 4 kb of data each. They are best used with simple data.
    - If you find you need to store larger quantities of data or complex data types, *and you don't need to share data across subdomains*, then local storage is a better option (see [LmdStorage](../LmdStorage/README.md)).
- Where `SameSite` is set to `none` (cross-site access allowed), `secure` must be set to `true` (access over HTTPS only), or it may be rejected by modern browsers (this library will set this automatically). If the domain serving the cookie does not have HTTPS, then you can not specify `none` for `SameSite`.

---

**Note:** As with all scripts in this repository, I made this for my own small projects where dependency on a larger, more feature-rich, library would be overkill. Feel free to use if you think it's helpful for your projects.
