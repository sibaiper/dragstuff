# DRAGS: easy to use dragging functionality with complex events.


## to use it on a single item:

 
`Drag.init("#cssSelector");`
      
_you can also use a variable instead of a CSS selector_

## or use it on an array:

`items.forEach(item => {
            Drag.init(item, {
                bounds: ".container",
            })
        })` 

## you can also specify the direction on which to drag in:

`Drag.init(item, {bounds: ".container",  type: "x" })`


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