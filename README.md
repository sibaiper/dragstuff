# DRAGSTUFF: Easy-to-Use Dragging Functionality with Complex Events

DRAGSTUFF is a lightweight and versatile JavaScript library for implementing drag functionality in your web applications. With DRAGSTUFF, you can easily integrate dragging capabilities into your projects, whether it's for moving elements within a container or implementing complex event handling during dragging actions.


[View Demo](https://dragstuff-demo.vercel.app/)



## Installation

You can install DRAGSTUFF via npm:

```bash
npm install dragstuff 
```



to import DRAGSTUFF:
```bash
import dragstuff from "dragstuff";
```


# USAGE:

**basic example on a single HTML element:**

`dragstuff.init("#cssSelector");`
_you can also use a variable instead of a CSS selector_


**or use it on an array:**

`items.forEach(item => {
            dragstuff.init(item, {
                bounds: ".container",
            })
        })` 

**you can also specify the direction on which to drag in:**

`dragstuff.init(item, {bounds: ".container",  type: "x" })`


## settings avaiable to change:

call a function only if the user does initialize dragging:
`onClick: () => {}`

keep calling a function as long as the user is moving the mouse after initialzing drag. 
`onDrag: () => {}`

call a function only once the user stops dragging
`onDragEnd: () => {}`

call a function once only if the user initialzed drag.
`onDragStart: () => {}` 

specify the direction of the drag. 
`type: "x"` can be set to x or y (or both but why)

specify the area where to not allow the object to be dragged beyond. 
`bounds: "cssElement"` or you can use an elen

##
### future plans: add the ability to change the drag init threshold.