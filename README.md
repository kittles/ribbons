ribbons
=======

Ribbons stream across an element of your choosing!


![example](http://i.imgur.com/lZ3qBgu.gif)

## Usage

Initialize with:
```javascript
Ribbons.initWithOptions({
    element: "#someCoolElement",
    // other config options
});
```
Start ribbons with `Ribbons.startRibbons();`

Stop ribbons with `Ribbons.stopRibbons();`

Change element ribbons are attached to with `Ribbons.setElement(<some other jquery selector>);`

## Discussion
This puts a transparent canvas over whatever element you specify, and draws "ribbons" streaming across it. Depends on jQuery and the Kinetic.js framework. Clone and open the ribbonsExample.html to see how changing parameters affects the ribbons.
