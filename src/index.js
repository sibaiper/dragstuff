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

    //for circle calculations:
    let center_x, center_y, r;

    let isDragging = false;
    let isClick = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let threshold = options && options.threshold ? options.threshold : 5;

    let type = options && options.type ? options.type : "xy"; // I think these vars are not needed here
    // let bounds = options.bounds || null; // I think these vars are not needed
    let bounds = options && options.bounds ? options.bounds : null; // I think these vars are not needed

    let onDragStart =
      options && options.onDragStart ? options.onDragStart : function () {};
    let onDragEnd =
      options && options.onDragEnd ? options.onDragEnd : function () {};
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
      draggable.style.isolation = "isolate";

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

    if (options && bounds.element && bounds.type === "circle") {
      let bounding_circle = getElement(bounds.element);

      if (bounding_circle instanceof HTMLElement) {
        //calc the radius
        r = bounding_circle.clientWidth / 2;

        //position the draggable item in the center of the circle thats to be dragged.
        draggable.style.left =
          bounding_circle.offsetLeft +
          bounding_circle.clientWidth / 2 -
          draggable.clientWidth / 2 +
          "px";
        draggable.style.top =
          bounding_circle.offsetTop +
          bounding_circle.clientHeight / 2 -
          draggable.clientHeight / 2 +
          "px";

        //get computed position style: if relative = calc from center of the bounding box. if absolute calc from the offsetHeight + width of the item.
        const boundingEl_computerStyle =
          window.getComputedStyle(bounding_circle);
        const bounding_position =
          boundingEl_computerStyle.getPropertyValue("position");

        if (bounding_position === "relative") {
          center_x =
            bounding_circle.clientWidth / 2 - draggable.clientWidth / 2;
          center_y =
            bounding_circle.clientHeight / 2 - draggable.clientHeight / 2;

          //position the draggable item in the center of the circle thats to be dragged.
          draggable.style.left =
            bounding_circle.clientWidth / 2 - draggable.clientWidth / 2 + "px";
          draggable.style.top =
            bounding_circle.clientHeight / 2 -
            draggable.clientHeight / 2 +
            "px";
        } else {
          // If position is not relative, use offsetLeft and offsetTop as usual
          center_x =
            bounding_circle.offsetLeft +
            bounding_circle.clientWidth / 2 -
            draggable.clientWidth / 2;
          center_y =
            bounding_circle.offsetTop +
            bounding_circle.clientHeight / 2 -
            draggable.clientHeight / 2;
        }
      } else {
        console.log("Container element was not found.");
      }
    } else if (
      options &&
      options.bounds &&
      (typeof options.bounds === "string" ||
      options.bounds instanceof HTMLElement)
    ) {
      let bounding_box_ = getElement(options.bounds);

      if(bounding_box_ !== draggable.parentElement) {
        console.log(bounding_box_ === draggable.parentElement);
        let computedStyles = window.getComputedStyle(bounding_box_);
        let position = computedStyles.getPropertyValue("position");
  
        if (position === "relative") {
          //position the draggable item inside the bounding element:
          draggable.style.left =
            bounding_box_.offsetLeft +
            bounding_box_.clientWidth / 2 -
            draggable.clientWidth / 2 +
            "px";
          draggable.style.top =
            bounding_box_.offsetTop +
            bounding_box_.clientHeight / 2 -
            draggable.clientHeight / 2 +
            "px";
        } else {
          // If position is not relative, position the element relatively
          draggable.style.left = bounding_box_.offsetLeft + +"px";
          draggable.style.top = bounding_box_.offsetTop + "px";
        }

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

        if (
          options &&
          bounds &&
          typeof bounds === "object" &&
          !(bounds instanceof HTMLElement)
        ) {
          let bounding_circle = getElement(bounds.element);

          if (bounding_circle instanceof HTMLElement) {
            // let minX, minY, maxX, maxY;

            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;
            let dx = x - center_x;
            let dy = y - center_y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let outOfRange = distance > r;

            if (outOfRange) {
              newX = (center_x + (r * (x - center_x)) / distance).toPrecision(
                4
              );
              newY = (center_y + (r * (y - center_y)) / distance).toPrecision(
                4
              );
            }

            draggable.style.left = newX;

            draggable.style.top = newY;
          } else {
            // The variable is not an HTML element
            newX = e.clientX - offsetX;
            newY = e.clientY - offsetY;
          }
        }

        if (
          (options && bounds) ||
          typeof bounds === "string" ||
          bounds instanceof HTMLElement
        ) {
          let bounding_box = getElement(bounds);

          if (bounding_box instanceof HTMLElement) {
            const computedStyles = window.getComputedStyle(bounding_box);
            const position = computedStyles.getPropertyValue("position");

            let minX, minY, maxX, maxY;

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
          } else if (!bounds.element && !bounds instanceof HTMLElement) {
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
        } else if (type === "xy") {
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

    return {threshold: threshold, type: type, bounds: bounds};
  },
};

export default Drag;
