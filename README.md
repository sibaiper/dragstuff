
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

**BASEIC EXAMPLE:**

```javascript
dragstuff.init("#cssSelector");
```


**USE IT ON AN ARRAY:**

```javascript
items.forEach(item => {
      dragstuff.init(item, {
            bounds: ".container",
      })
})
``` 

**BOUND THE ELEMENT IN A CIRCULAR CONTAINER**

```javascript
dragstuff.init(item, {
      bounds: {
            type:"circle", 
            element: container
      }
})
```

## settings avaiable to change:

Ignore a list of child elements inside the selected element: 
`ingore: [el1, el2 ...]`

call a function only if the user does initialize dragging:
`onClick: () => {}`

keep calling a function as long as the user is moving the mouse after initialzing drag. 
`onDrag: () => {}`

call a function only once the user stops dragging
`onDragEnd: () => {}`

call a function once only if the user initialzed drag.
`onDragStart: () => {}` 

call a function once on mouseup regardless on click or dragend.
`onMouseUp: () => {}` 

call a function once on mousedown regardless on click or dragend
`onMouseDown () => {}` 

specify the direction of the drag. 
`axisLock: "x"` can be set to x or y (or both but why)

specify the area where to not allow the object to be dragged beyond. 
`bounds: "cssElement"` or you can use an element

specify the threshold to init drag:  
`threshold: 20 `

specify the snapvalue:  
`liveSnap: 20 ` ( automatically applies Math.ceil(value) )

##
