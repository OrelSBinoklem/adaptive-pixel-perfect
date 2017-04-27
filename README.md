Pixel perfect for multiple resolutions

## Install

```bash
$ npm i adaptive-pixel-perfect --save-dev
```

## Usage
```js
 a_pp.start(port, designFolder, portForBrowserSync);
```

Use the plugin on port 3010 together with browserSync, (pre-create a design folder and add design images to it):

```js
var a_pp = require('adaptive-pixel-perfect');
var browserSync = require('browser-sync').create();

var port = 3010;
var folderForDesignScreenshots = "design";
var portForBrowserSync = 3000;

browserSync.init({
    server: "./",
    cors: true,
    middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    },
    socket: {
        domain: 'localhost:' + portForBrowserSync
    },
    scriptPath: function (path, port, options) {
        return "http://" + options.getIn(['socket', 'domain']) + path;
    }
});

a_pp.start(port, folderForDesignScreenshots, portForBrowserSync);
```

The plugin will be available at **http://localhost:3010/?a-pp=1**

## Supported key combinations
* left mouse button + 1 - 9, 0 (switch between resolutions)
* left mouse button + W, A, S, D (change the position of the iframe window)
* left mouse button + Z, X, C (site layout, site layout on top of the design, the design)
* left mouse button + Q (flicker function)
* Ctrl + R + move mouse (resize iframe)

## Release Notes

| Release | Notes |
| --- | --- |
| 0.3.0 | Added a window with settings, added English, moved session groups to the settings window and divided the parameters for more flexible customization |
| 0.2.8 | Fixed synchronization select pages |
| 0.2.7 | Fixed saving the selected synchronization group |
| 0.2.6 | If the user cuts the iframe then the button ceases to be active, but it remains to highlight the "badge". Now in the session, the priority of choosing the resolution or the size as a result of the manual resizing of the iframe |
| 0.2.4 | Additing bootom space for close tag body, to be able to scroll down and see in the design which block should be typed as follows. Added the flicker function to make it easier to adjust the block with fuzzy edges under the design |
| 0.2.0 | Improved design and made it more appropriate bootstrap. Additing hot-keys |
| 0.1.0 | Alpha release |

## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->