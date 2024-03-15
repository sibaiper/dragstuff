// src/main.js
function clamp(lowerBound, upperBound, value) {
  if (typeof value === "undefined") {
    return function(value2) {
      return Math.min(Math.max(value2, lowerBound), upperBound);
    };
  } else {
    return Math.min(Math.max(value, lowerBound), upperBound);
  }
}
function drag_y(el, val = newY) {
  el.style.top = `${val}px`;
}
function drag_x(el, val = newY) {
  el.style.left = `${val}px`;
}
function getElement(selectorOrElement) {
  if (typeof selectorOrElement === "string") {
    return document.querySelector(selectorOrElement);
  } else if (selectorOrElement instanceof HTMLElement) {
    return selectorOrElement;
  }
}
var draggableObjects = [];
var Drag = {
  init: function(selector, options) {
    const draggable = getElement(selector);
    draggable.style.userSelect = "none";
    draggable.style.position = "absolute";
    draggable.style.cursor = "grab";
    draggableObjects.push(draggable);
    let isDragging = false;
    let isClick = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let threshold = 5;
    let type = options.type || "xy";
    let bounds = options.bounds || null;
    let onDragStart = options.onDragStart || function() {
    };
    let onDragEnd = options.onDragEnd || function() {
    };
    let onClick = options.onClick || function() {
    };
    let onDrag = options.onDrag || function() {
    };
    let originalZIndex = 1;
    var newX, newY2;
    setupListeners(draggable, options);
    function setupListeners(draggable2, options2) {
      draggable2.addEventListener(
        "mousedown",
        (e) => handleMouseDown(e, draggable2)
      );
      document.addEventListener("mouseup", () => handleMouseUp());
      draggable2.addEventListener("click", () => handleObjectClick());
    }
    function handleMouseDown(e, el) {
      el.style.isolation = "isolate";
      document.body.style.cursor = "grabbing";
      draggable.style.cursor = "grabbing";
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      el.style.zIndex = getHighestZIndex() + 1;
      originalZIndex = parseInt(getComputedStyle(el).zIndex) || 1;
      document.addEventListener("mousemove", move);
    }
    function handleMouseUp() {
      document.removeEventListener("mousemove", move);
      document.body.style.cursor = "default";
      draggable.style.cursor = "grab";
      if (!isDragging) {
        isClick = true;
      } else {
        isDragging = false;
        onDragEnd();
      }
    }
    function handleObjectClick() {
      if (isClick && !isDragging) {
        if (parseInt(getComputedStyle(draggable).zIndex) === getHighestZIndex()) {
          draggable.style.zIndex = originalZIndex;
        } else {
          draggable.style.zIndex = getHighestZIndex() + 1;
        }
        isClick = false;
        onClick();
      }
    }
    function move(e) {
      const deltaX = Math.abs(e.clientX - startMouseX);
      const deltaY = Math.abs(e.clientY - startMouseY);
      if (!isDragging && (deltaX > threshold || deltaY > threshold)) {
        isDragging = true;
        isClick = false;
        onDragStart();
      }
      if (isDragging) {
        onDrag();
        newX = e.clientX - offsetX;
        newY2 = e.clientY - offsetY;
        if (options && options.type === "x") {
          newX = e.clientX - offsetX;
          newY2 = draggable.offsetTop;
        } else if (options && options.type === "y") {
          newX = draggable.offsetLeft;
          newY2 = e.clientY - offsetY;
        } else {
          newX = e.clientX - offsetX;
          newY2 = e.clientY - offsetY;
        }
        if (options && options.bounds) {
          let bounding_box = document.querySelector(options.bounds);
          if (bounding_box instanceof HTMLElement) {
            const computedStyles = window.getComputedStyle(bounding_box);
            const position = computedStyles.getPropertyValue("position");
            if (position === "relative") {
              minX = 0;
              minY = 0;
            } else {
              minX = bounding_box.offsetLeft;
              minY = bounding_box.offsetTop;
            }
            const bound_width = parseFloat(
              computedStyles.getPropertyValue("width")
            );
            const bound_height = parseFloat(
              computedStyles.getPropertyValue("height")
            );
            maxX = minX + bound_width - draggable.clientWidth;
            maxY = minY + bound_height - draggable.clientHeight;
            newX = clamp(minX, maxX, newX);
            newY2 = clamp(minY, maxY, newY2);
          } else {
            console.log("could not find bounding element");
            newX = e.clientX - offsetX;
            newY2 = e.clientY - offsetY;
          }
        }
        if (options && options.type === "x") {
          drag_x(draggable, newX);
        } else if (options && options.type === "y") {
          drag_y(draggable, newY2);
        } else {
          drag_x(draggable, newX);
          drag_y(draggable, newY2);
        }
      }
    }
    function getHighestZIndex() {
      let highestZIndex = 0;
      draggableObjects.forEach((element) => {
        const zIndex = parseInt(getComputedStyle(element).zIndex) || 0;
        highestZIndex = Math.max(highestZIndex, zIndex);
      });
      return highestZIndex;
    }
  }
};
export {
  Drag
};
//# sourceMappingURL=main.js.map