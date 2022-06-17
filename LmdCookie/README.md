# LmdCookie

---

**Note:** As with all scripts in this repository, I made this for my own small projects where dependency on a larger, more feature-rich, library would be overkill. Feel free to use if you think it's helpful for your projects.

---

Lightweight wrapper for browser cookies.

## Minimum Requirements

- ECMAScript 6 (ES6, aka ECMAScript 2015) capable browsers.

## Usage

Include the script in the `<head>` of your HTML document. Javascript classes must be defined (inserted) before they are used.

```html
<script src="path/to/LmdCookie.min.js"></script>
<script src="path/to/your-script.js"></script>
```

### Initialise: `new LmdCookie(prefix, path, domain, secure, sameSite)`

Initialise the cookie class with optional parameters.

- `prefix` - Prefix for cookie names - any cookie without prefix will be ignored (*defaulta to no prefix/empty string*).
- `path` -  Absolute path for cookie visibility (*defaults to current path*)
- `domain` - Cookie domain (*defaults to current domain only*)
- `secure` - Only send over https (*defaults to `false`*).
- `sameSite` - Same-origin/cross-site policy: 'lax', 'strict' or 'none' (*defaults to 'Lax'*).

If a prefix is provided, you do not need to use it when setting/getting/removing cookies, it is automatically added.

```javascript
// Basic - defaults only
$myCookie = new LmdCookie();

// Names prefixed by 'foo', accessible from any path from root directory, HTTPS only
$myCookie = new LmdCookie('foo', '/', null, true);

// Allow cross-site cookie
$myCookie = new LmdCookie('', null, null, false, 'none');
```

### Methods

#### `setCookie(name, value, expires)`

Set cookie data with expiration (default: 1 year).

- `name` - Name of the cookie to set/update, it will create the cookie if it does not exist (*required*)
- `value` - Cookie value can be any value that can be serialised into a JSON string (*required*).
- `expires` - Cookie expiration date can be a date token string (see [Token Format](#token-format) below) or a `Date` object (*optional, defaults to 1 year*).

```javascript
// Expire in 1 year (default)
$myCookie.set('greeting', 'Hello World');

// Expire after elapsed time
$myCookie.set('greeting', 'Hello World', '1y 6m'); // 1 year, 6 months

// Expire on specified date/time
$myCookie.set('greeting', 'Hello World', new Date('2025-06-20 11:00:00'));
```

##### Token Format

The date token string format is a *case-insensitive* sequence of digit/letter pairs, with each pair separated by a space.

For Example: `1y 6m 12h` = 1 year, 6 months and 12 hours.

| Token | Timespan | Example |
| :---: | :------- | :------ |
| `Y` | Year | `2y` = 2 years |
| `M` | Month | `3m` = 3 months |
| `D` | Days | `5d` = 5 days |
| `H` | Hours | `6h` = 6 hours |
| `Mi` | Minutes | `30mi` = 30 minutes (note the two-letter code)|
| `S` | Seconds | `20s` = 20 seconds |
| `W` | Weeks | `2w` = 2 weeks |

#### `getCookie(name)`

Get cookie data - returns either a string or an array, or null if the cookie name doesn't exist.

- `name` - Name of the cookie to get (*required*). Will return `undefined` if the cookie does not exist.

```javascript
const greet = $myCookie.getCookie('greeting');
console.log(greet); // returns 'Hello World'
```

**Note** It is important to remember that once a cookie has been created/set/updated, you can't retrieve its value until after a document refresh/reload.

#### `removeCookie(name)`

Remove/delete cookie from browser.

- `name` - Name of the cookie to remove/delete (*required*).

```javascript
$myCookie.removeCookie('greeting');

// After page refresh
console.log($myCookie.getCookie('greeting')); // returns undefined
```
