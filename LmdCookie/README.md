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

### Initialise: `new LmdCookie(name, path, domain, secure, sameSite)`

Initialise a cookie with its parameters, only the first parameter (`name`) is required.

- `name` - Name (key) of browser cookie (*required*).
- `path` -  Absolute path for cookie visibility (*optional, defaults to current path*)
- `domain` - Cookie domain (*optional, defaults to current domain only*)
- `secure` - Only send over https (*optional, defaults to `false`*).
- `sameSite` - same-origin/cross-site policy: 'lax', 'strict' or 'none' (*optional, defaults to 'lax'*).

```javascript
$myCookie = new LmdCookie('foo'); // Basic

$myCookie = new LmdCookie('foo', '/', null, true); // Accessible from any path from root directory, HTTPS only

$myCookie = new LmdCookie('foo', null, null, false, 'none'); // allow cross-site cookie
```

### Methods

#### `setCookie(value, expires)`

Set cookie data with expiration (default: 1 year).

- `value` - Cookie value can be a `string`, `integer` or simple `array` (*required*).
- `expires` - Cookie expiration date can be a date token string (see [Token Format](#token-format) below) or a `Date` object (*optional, defaults to 1 year*). 

```javascript
// Expire in 1 year (default)
$myCookie.set('Hello World');

// Expire on specified date/time
$myCookie.set('Hello World', new Date('2025-06-20 11:00:00'));

// Expire after elapsed time
$myCookie.set('Hello World', '1y 6m'); // 1 year, 6 months
```

##### Token Format

The date token string format is a *case-insensitive* sequence of digit/letter pairs, with each pair separated by a space.

For Example: `1y 6m 12h` = 1 year, 6 months and 12 hours 
 
| Token | Timespan | Example |
| :---: | :------- | :------ |
| `Y` | Year | `2y` = 2 years |
| `M` | Month | `3m` = 3 months |
| `D` | Days | `5d` = 5 days |
| `H` | Hours | `6h` = 6 hours |
| `Mi` | Minutes | `30mi` = 30 minutes (note the two-letter code)|
| `S` | Seconds | `20s` = 20 seconds |
| `W` | Weeks | `2w` = 2 weeks |

#### `getCookie()`

Get cookie data - returns either a string or an array, or null if the cookie name doesn't exist.

```javascript
let foo = $myCookie.getCookie();
console.log(foo); // returns 'Hello World'
```

**Note** It is important to remember that once a cookie has been created/set/updated, you can't retrieve its value until after a document refresh/reload.

#### `removeCookie()`

Remove/delete cookie from browser.

```javascript
$myCookie.removeCookie();

// After page refresh
console.log($myCookie.getCookie()); // returns null
```
