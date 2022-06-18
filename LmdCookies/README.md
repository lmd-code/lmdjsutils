# LmdCookies

---

**Note:** As with all scripts in this repository, I made this for my own small projects where dependency on a larger, more feature-rich, library would be overkill. Feel free to use if you think it's helpful for your projects.

---

Lightweight wrapper for browser cookies.

## General Cookie Notes

- You can only have a total of ~20 cookies per domain (depending on the browser), storing up to a maximum of 4 kb of data each. They are best used with simple data.
    - If you find you need to store larger quantities of data or complex data types, then `localStorage` is a better option (see [LmdStorage](../LmdStorage/README.md)).
- Where `SameSite` is set to `none` (cross-site access allowed), `secure` must be set to `true` (access over 'HTTPS' only), or it may be rejected by modern browsers (this library will set this automatically). If the domain serving the cookie does not have HTTPS, then you can not specify `none` for `SameSite`.

## Minimum Requirements

- ECMAScript 6 (ES6, aka ECMAScript 2015) capable browsers.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdCookies.min.js"></script>
<script src="path/to/your-script.js"></script>
```

In your script, initialise the cookie class with optional parameters.

```javascript
new LmdCookies(prefix, path, domain, secure, sameSite)
```

| Param | Type | Description |
| --- | --- | --- |
| `prefix` | string/null | Prefix for cookie names. When specified, any cookie without the prefix will be ignored (*defaults to no prefix/empty string*). |
| `path` |  string/null | Absolute path for cookie visibility (*defaults to current path*). |
| `domain` | string/null | Cookie domain (*defaults to current domain*). |
| `secure` | boolean | Only send over https (*defaults to `false`*). |
| `sameSite` | string | Same-origin/cross-site policy: 'lax', 'strict' or 'none' (*defaults to 'lax'*). |

If a prefix is provided, you do not need to use it when setting/getting/removing cookies, it is automatically added.

```javascript
// Basic - defaults only
$myCookies = new LmdCookies();

// Names prefixed by 'foo', accessible from any path from root directory, HTTPS only
$myCookies = new LmdCookies('foo', '/', null, true);

// Allow cross-site cookie
$myCookies = new LmdCookies(null, null, null, false, 'none');
```

## Properties

### `isEnabled`

Save yourself a headache and check if browser cookies are available before you use them.

```javascript
const cookiesAvailable = $myCookies.isEnabled; // returns boolean true/false
```

### `count`

Get number of cookies retrieved. **Note:** if using a prefix, it will only count cookies using that prefix.

```javascript

let numItems = $myCookies.count; // returns number
```

## Methods

### `set(name, value, expires)`

Set cookie data with optional expiration date (the default creates a 'session' cookie).

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | Name of the cookie to set/update, it will create the cookie if it does not exist (*required*). |
| `value` | mixed | Cookie value can be any value that can be serialised into a JSON string (*required*). |
| `expires` | string|Date | Cookie expiration date can be a date token string (see [Token Format](#token-format) below) or a `Date` object (*optional, defaults to 'session' cookie*). |

```javascript
// Expire at the end of the session (default)
$myCookies.set('greeting', 'Hello World');

// Expire after elapsed time
$myCookies.set('greeting', 'Hello World', '1y 6m'); // 1 year, 6 months

// Expire on specified date/time
$myCookies.set('greeting', 'Hello World', new Date('2025-06-20 11:00:00'));
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
| `name` | string | Name of the cookie to check (*required*). |

```javascript
console.log($myCookies.has('greeting')); // returns true

console.log($myCookies.has('nope')); // returns false
```

### `get(name)`

Get cookie data - returns either a string or an array, or null if the cookie name doesn't exist.

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | Name of the cookie to get (*required*). Will return `undefined` if the cookie does not exist. |

```javascript
const greet = $myCookies.get('greeting');
console.log(greet); // returns 'Hello World'
```

### `remove(name)`

Remove/delete cookie from browser.

| Param | Type | Description |
| --- | --- | --- |
| `name` | string | Name of the cookie to remove/delete (*required*). |

```javascript
$myCookies.remove('greeting');

// After page refresh
console.log($myCookies.get('greeting')); // returns undefined
```
