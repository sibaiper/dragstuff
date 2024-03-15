function clamp(lowerBound, upperBound, value) {
  if (typeof value === "undefined") {
    return function (value) {
      return Math.min(Math.max(value, lowerBound), upperBound);
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
    // If it's a string, assume it's a CSS selector
    return document.querySelector(selectorOrElement);
  } else if (selectorOrElement instanceof HTMLElement) {
    // Otherwise, assume it's already a reference to a DOM element or another JS variable
    return selectorOrElement;
  }
}

const draggableObjects = [];

const Drag = {
  init: function (selector, options) {
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

    let type = options.type || "xy"; // I think these vars are not needed here
    let bounds = options.bounds || null; // I think these vars are not needed
    let onDragStart = options.onDragStart || function () {};
    let onDragEnd = options.onDragEnd || function () {};
    let onClick = options.onClick || function () {};
    let onDrag = options.onDrag || function () {};
    let originalZIndex = 1; // Initial z-index value

    var newX, newY;

    setupListeners(draggable, options);

    function setupListeners(draggable, options) {
      draggable.addEventListener("mousedown", (e) =>
        handleMouseDown(e, draggable)
      );
      document.addEventListener("mouseup", () => handleMouseUp());
      draggable.addEventListener("click", () => handleObjectClick());

      // Add other event listeners or options as needed
    }

    function handleMouseDown(e, el) {
      el.style.isolation = "isolate";

      //change mouse icon to grabbing
      document.body.style.cursor = "grabbing";
      draggable.style.cursor = "grabbing";

      startMouseX = e.clientX;
      startMouseY = e.clientY;

      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;

      el.style.zIndex = getHighestZIndex() + 1; // Bring to the top

      originalZIndex = parseInt(getComputedStyle(el).zIndex) || 1;

      document.addEventListener("mousemove", move);
    }

    function handleMouseUp() {
      //remove event listner to stop the dragging after mouse is not clicked anymore
      document.removeEventListener("mousemove", move);

      //change mouse icon back to grab
      document.body.style.cursor = "default";
      draggable.style.cursor = "grab";

      //click or drag end function?
      if (!isDragging) {
        isClick = true;
      } else {
        isDragging = false;
        onDragEnd();
      }
    }

    function handleObjectClick() {
      if (isClick && !isDragging) {
        if (
          parseInt(getComputedStyle(draggable).zIndex) === getHighestZIndex()
        ) {
          // Clicked on the already top element, set it back to original z-index
          draggable.style.zIndex = originalZIndex;
        } else {
          // Clicked on a different element, bring it to the top
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
        newY = e.clientY - offsetY;

        if (options && options.type === "x") {
          // For 'x' type, only allow horizontal dragging (along the x-axis)
          newX = e.clientX - offsetX;
          newY = draggable.offsetTop;
        } else if (options && options.type === "y") {
          // For 'y' type, only allow vertical dragging (along the y-axis)
          newX = draggable.offsetLeft;
          newY = e.clientY - offsetY;
        } else {
          // For any other type or no type specified, allow dragging in both 'x' and 'y' axes
          newX = e.clientX - offsetX;
          newY = e.clientY - offsetY;
        }

        if (options && options.bounds) {
          let bounding_box = document.querySelector(options.bounds);

          if (bounding_box instanceof HTMLElement) {
            const computedStyles = window.getComputedStyle(bounding_box);
            const position = computedStyles.getPropertyValue("position");

            if (position === "relative") {
              // If position is relative, calculate offsets relative to the bounding box itself
              minX = 0; // Relative to the bounding box
              minY = 0; // Relative to the bounding box
            } else {
              // If position is not relative, use offsetLeft and offsetTop as usual
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

            // Clamp newX and newY between minX, minY, maxX, maxY as needed
            newX = clamp(minX, maxX, newX);
            newY = clamp(minY, maxY, newY);
          } else {
            // The variable is not an HTML element
            console.log("could not find bounding element");

            newX = e.clientX - offsetX;
            newY = e.clientY - offsetY;
          }
        }

        if (options && options.type === "x") {
          drag_x(draggable, newX);
        } else if (options && options.type === "y") {
          drag_y(draggable, newY);
        } else {
          drag_x(draggable, newX);
          drag_y(draggable, newY);
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
  },
};


export { Drag };