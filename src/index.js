function clamp(lowerBound, upperBound, value) {
  if (typeof value === "undefined") {
    return function (value) {
      return Math.min(Math.max(value, lowerBound), upperBound);
    };
  } else {
    return Math.min(Math.max(value, lowerBound), upperBound);
  }
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
    let threshold = options && options.threshold ? options.threshold : 5;

    let type = options && options.type ? options.type : "xy"; // I think these vars are not needed here
    // let bounds = options.bounds || null; // I think these vars are not needed
    let onDragStart = options && options.onDragStart ? options.onDragStart : function () {};
    let onDragEnd = options && options.onDragEnd ? options.onDragEnd : function () {};
    let onClick = options && options.onClick ? options.onClick : function () {};
    let onDrag = options && options.onDrag ? options.onDrag : function () {};
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

        if (options && options.bounds) {
          let bounding_box = document.querySelector(options.bounds);

          if (bounding_box instanceof HTMLElement) {
            const computedStyles = window.getComputedStyle(bounding_box);
            const position = computedStyles.getPropertyValue("position");

            let minX, minY, maxX, maxY

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


        if (options && type === "x") {
          draggable.style.left = `${newX}px`;
        } else if (options && type === "y") {
          draggable.style.top = `${newY}px`;
        } else if (type === "xy"){
          draggable.style.left = `${newX}px`;
          draggable.style.top = `${newY}px`;
        } else {
          draggable.style.left = `${newX}px`;
          draggable.style.top = `${newY}px`;
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



export default Drag;