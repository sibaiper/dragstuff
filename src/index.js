class Drag {

  constructor(selector, options = {}) {
    this.grabCursor = "grab";
    this.grabbingCursor = "grabbing";
    this.ignoreElementsCursor = options.ignoreCursor || "auto";

    this.draggable = getElement(selector);
    this.draggable.style.userSelect = "none";
    this.draggable.style.position = "absolute";
    this.draggable.style.cursor = "grab";

    draggableObjects.push(this.draggable);

    //for circle calculations:
    this.center_x, this.center_y, this.r;

    this.isDragging = false;
    this.isClick = false;
    this.startMouseX = 0;
    this.startMouseY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.threshold = options.threshold || 5;
    this.snapValue = 1;
    //make sure it can only be set to something above 0:
    if (options.liveSnap && options.liveSnap > 0) {
      this.snapValue = Math.ceil(options.liveSnap);
    }

    this.lockAxis = options.lockAxis || "xy"; // I think these vars are not needed here
    this.bounds = options.bounds || null; // I think these vars are not needed

    this.onDragStart = options.onDragStart || function () {};
    this.onDragEnd = options.onDragEnd || function () {};
    this.onClick = options.onClick || function () {};
    this.onDrag = options.onDrag || function () {};
    this.onMouseDown = options.onMouseDown || function () {};
    this.onMouseUp = options.onMouseUp || function () {};

    this.originalZIndex = 1; // Initial z-index value

    this.newX, this.newY;

    this.bounds = options.bounds || null; // I think these vars are not needed
    //method to set the bounds minX, minY, maxX, maxX
    this.setBounds();

    this.ignore = options.ignore || null;

    this.minX, this.minY, this.maxX, this.maxY;

    this.bounding_box;
    this.bounding_circle;

    this.ignore = options.ignore || [];

    //uncomment this to make it that on init dragstuff will find all elements to ignore and store them
    for (let i = 0; i < this.ignore.length; i++) {
      //get the items specified by the user:
      const element = this.ignore[i];
      //check if theyre a DOM element:
      if (is.dom(element)) {
        //check if the item has nested children:
        if (hasNestedChild(element)) {
          //check if t  he nested children are already no added to the this.ignore array:
          if (!this.ignore.includes(...getNestedChildren(element))) {
            //if theyre not added (!includes), then add them to the this.ignore array to make them ignorable:
            this.ignore.push(...getNestedChildren(element));
          }
        }
      }
    }

    // Binding event handler methods
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleObjectClick = this.handleObjectClick.bind(this);
    this.move = this.move.bind(this);

    this.setupListeners(this.draggable);
  }

  static init(selector, options = {}) {
    return new Drag(selector, options);
  }

  setBounds() {
    //set rect bounds:
    if (
      (this.bounds && (is.dom(this.bounds) || is.str(this.bounds))) ||
      (is.obj(this.bounds) && this.bounds.type === "rect")
    ) {
      if (is.obj(this.bounds) && this.bounds.type === "rect") {
        this.bounding_box = getElement(this.bounds.element);
      }

      if (is.dom(this.bounds) && !is.obj(this.bounds)) {
        this.bounding_box = getElement(this.bounds);
      }

      const computedStyles = window.getComputedStyle(this.bounding_box);
      const position = computedStyles.getPropertyValue("position");

      if (position === "relative") {
        // If position is relative, calculate offsets relative to the bounding box itself
        this.minX = 0; // Relative to the bounding box
        this.minY = 0; // Relative to the bounding box
      } else {
        // If position is not relative, use offsetLeft and offsetTop as usual
        this.minX = this.bounding_box.offsetLeft;
        this.minY = this.bounding_box.offsetTop;
      }

      const bound_width = parseFloat(computedStyles.getPropertyValue("width"));
      const bound_height = parseFloat(
        computedStyles.getPropertyValue("height")
      );

      this.maxX = this.minX + bound_width - this.draggable.clientWidth;
      this.maxY = this.minY + bound_height - this.draggable.clientHeight;
    }
    //set bounds for circle
    if (is.obj(this.bounds) && !is.str(this.bounds)) {
      if (this.bounds.type === "circle") {
        this.bounding_circle = getElement(this.bounds.element);

        //calc the radius
        this.r = this.bounding_circle.clientWidth / 2;

        //position the draggable item in the center of the circle thats to be dragged.
        this.draggable.style.left =
          this.bounding_circle.offsetLeft +
          this.bounding_circle.clientWidth / 2 -
          this.draggable.clientWidth / 2 +
          "px";
        this.draggable.style.top =
          this.bounding_circle.offsetTop +
          this.bounding_circle.clientHeight / 2 -
          this.draggable.clientHeight / 2 +
          "px";

        //get computed position style: if relative = calc from center of the bounding box. if absolute calc from the offsetHeight + width of the item.
        const boundingEl_computerStyle = window.getComputedStyle(
          this.bounding_circle
        );
        const bounding_position =
          boundingEl_computerStyle.getPropertyValue("position");

        if (bounding_position === "relative") {
          this.center_x =
            this.bounding_circle.clientWidth / 2 -
            this.draggable.clientWidth / 2;
          this.center_y =
            this.bounding_circle.clientHeight / 2 -
            this.draggable.clientHeight / 2;

          //position the this.draggable item in the center of the circle thats to be dragged.
          this.draggable.style.left =
            this.bounding_circle.clientWidth / 2 -
            this.draggable.clientWidth / 2 +
            "px";
          this.draggable.style.top =
            this.bounding_circle.clientHeight / 2 -
            this.draggable.clientHeight / 2 +
            "px";
        } else {
          // If position is not relative, use offsetLeft and offsetTop as usual
          this.center_x =
            this.bounding_circle.offsetLeft +
            this.bounding_circle.clientWidth / 2 -
            this.draggable.clientWidth / 2;
          this.center_y =
            this.bounding_circle.offsetTop +
            this.bounding_circle.clientHeight / 2 -
            this.draggable.clientHeight / 2;
        }
      }
    }
  }

  setupListeners(draggable) {
    draggable.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);
    draggable.addEventListener("click", this.handleObjectClick);

    //ignore cursros:
    if (this.ignore) {
      //loop through the want to be ignore items:
      for (let i = 0; i < this.ignore.length; i++) {
        const element = this.ignore[i];
        if (is.dom(element)) {
          element.addEventListener("mouseenter", () => {
            element.style.cursor = this.ignoreElementsCursor;
          });
        }
      }
    }
  }

  handleMouseDown(e) {
    if (this.ignore) {
      for (let i = 0; i < this.ignore.length; i++) {
        //get the items specified by the user:
        const element = this.ignore[i];
        //check if theyre a DOM element:
        if (is.dom(element)) {
          if (e.target == element) {
            return;
          }
        }
      }
    }

    //mouse up regardless:
    this.onMouseDown();

    if (this.draggable) {
      this.draggable.style.isolation = "isolate";

      //change mouse icon to grabbing
      document.body.style.cursor = "grabbing";
      this.draggable.style.cursor = "grabbing";

      this.startMouseX = e.clientX;
      this.startMouseY = e.clientY;

      this.offsetX = e.clientX - this.draggable.offsetLeft;
      this.offsetY = e.clientY - this.draggable.offsetTop;

      this.draggable.style.zIndex = this.getHighestZIndex() + 1; // Bring to the top

      this.originalZIndex =
        parseInt(getComputedStyle(this.draggable).zIndex) || 1;

      document.addEventListener("mousemove", this.move);
    }
  }

  handleMouseUp() {
    //mouse up regardless:
    this.onMouseUp();

    document.removeEventListener("mousemove", this.move); // Remove the bound function

    //change mouse icon back to grab
    document.body.style.cursor = "default";
    if (this.draggable) {
      this.draggable.style.cursor = "grab"; //why does this cause an error when returning somethign?
    }
    //click or drag end function?
    if (!this.isDragging) {
      this.isClick = true;
    } else {
      this.isDragging = false;
      this.onDragEnd();
    }
  }

  handleObjectClick() {
    if (this.isClick && !this.isDragging) {
      if (
        parseInt(getComputedStyle(this.draggable).zIndex) ===
        this.getHighestZIndex()
      ) {
        // Clicked on the already top element, set it back to original z-index
        this.draggable.style.zIndex = this.originalZIndex;
      } else {
        // Clicked on a different element, bring it to the top
        this.draggable.style.zIndex = this.getHighestZIndex() + 1;
      }
      this.isClick = false;
      this.onClick();
    }
  }

  move(e) {
    const deltaX = Math.abs(e.clientX - this.startMouseX);
    const deltaY = Math.abs(e.clientY - this.startMouseY);

    if (
      !this.isDragging &&
      (deltaX > this.threshold || deltaY > this.threshold)
    ) {
      this.isDragging = true;
      this.isClick = false;
      this.onDragStart();
    }

    if (this.isDragging) {
      this.onDrag();

      this.newX = e.clientX - this.offsetX;
      this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
      this.newY = e.clientY - this.offsetY;
      this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;

      //values: OBJECT(options) || STRING(DOM ELEMENT CSS) || DOM ELEMENT.
      //handle position of the circle:
      if (this.bounds.type === "circle") {
        // let minX, minY, maxX, maxY;

        let x = e.clientX - this.offsetX;
        let y = e.clientY - this.offsetY;
        let dx = x - this.center_x;
        let dy = y - this.center_y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let outOfRange = distance > this.r;

        if (outOfRange) {
          this.newX = (
            this.center_x +
            (this.r * (x - this.center_x)) / distance
          ).toPrecision(4);
          this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
          this.newY = (
            this.center_y +
            (this.r * (y - this.center_y)) / distance
          ).toPrecision(4);
          this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;
        }
        // this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
        // this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;
        this.draggable.style.left = `${this.newX}px`;
        this.draggable.style.top = `${this.newY}px`;

      }

      //fire these only of the bounds are NOT an object
      // if (is.str(this.bounds || is.dom(this.bounds))) {
      // Clamp newX and newY between minX, minY, maxX, maxY as needed
      this.newX = clamp(this.minX, this.maxX, this.newX);
      this.newY = clamp(this.minY, this.maxY, this.newY);

      //eventually move the item to where it needs to go:

      if (this.lockAxis === "x") {
        this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
        this.draggable.style.left = `${this.newX}px`;
      } else if (this.lockAxis === "y") {
        this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;
        this.draggable.style.top = `${this.newY}px`;
      } else if (this.lockAxis === "xy") {
        this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
        this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;
        this.draggable.style.left = `${this.newX}px`;
        this.draggable.style.top = `${this.newY}px`;
      } else {
        this.newX = Math.round(this.newX / this.snapValue) * this.snapValue;
        this.newY = Math.round(this.newY / this.snapValue) * this.snapValue;
        this.draggable.style.left = `${this.newX}px`;
        this.draggable.style.top = `${this.newY}px`;
      }
      // }
    }
  }

  getHighestZIndex() {
    let highestZIndex = 0;

    draggableObjects.forEach((element) => {
      const zIndex = parseInt(getComputedStyle(element).zIndex) || 0;
      highestZIndex = Math.max(highestZIndex, zIndex);
    });

    return highestZIndex;
  }


  destroy() {
    // Remove event listeners
    this.draggable.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.draggable.removeEventListener("click", this.handleObjectClick);
    document.removeEventListener("mousemove", this.move);


    // Optionally, restore styles or configurations
    this.draggable.style.cursor = "auto";
    this.draggable.style.userSelect = "auto";
    this.draggable.style.isolation = "auto";

    // Clean up any other references or state variables
    // For example, you may want to remove this instance from the draggableObjects array:
    const index = draggableObjects.indexOf(this.draggable);
    if (index !== -1) {
      draggableObjects.splice(index, 1);
    }

    // Optionally, nullify other references to DOM elements or objects
    this.draggable = null;
    this.ignore = null;

    // If you have any additional cleanup tasks, perform them here
  }
}


const draggableObjects = [];



//utils: 
function hasNestedChild(element) {
  //returns true or false
  if (element.children.length === 0) {
    return false; // No child element
  }

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    if (child.children.length > 0) {
      return true; // Found a child element with grandchildren
    }
    // Recursively check for grandchildren
    if (hasNestedChild(child)) {
      return true;
    }
  }

  return false; // No child element with grandchildren found
}
//usage hasNestedChild(element);

function getNestedChildren(element) {
  //returns array of all nested elements.
  const nestedChildren = [];

  function findNestedChildren(element) {
    if (element.children.length === 0) {
      return; // No child element
    }

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      nestedChildren.push(child); // Add child to the nestedChildren array
      // Recursively check for grandchildren
      findNestedChildren(child);
    }
  }

  // Start the recursive search
  findNestedChildren(element);

  return nestedChildren;
}

//usage getNestedChildren(element);

const is = {
  arr: (a) => Array.isArray(a),
  obj: (a) => stringContains(Object.prototype.toString.call(a), "Object"),
  pth: (a) => is.obj(a) && a.hasOwnProperty("totalLength"),
  svg: (a) => a instanceof SVGElement,
  inp: (a) => a instanceof HTMLInputElement,
  dom: (a) => a.nodeType || is.svg(a),
  str: (a) => typeof a === "string",
  fnc: (a) => typeof a === "function",
  und: (a) => typeof a === "undefined",
  nil: (a) => is.und(a) || a === null,
  hex: (a) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a),
  rgb: (a) => /^rgb/.test(a),
  hsl: (a) => /^hsl/.test(a),
  col: (a) => is.hex(a) || is.rgb(a) || is.hsl(a),
  key: (a) =>
    !defaultInstanceSettings.hasOwnProperty(a) &&
    !defaultTweenSettings.hasOwnProperty(a) &&
    a !== "targets" &&
    a !== "keyframes",
};

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

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




export default Drag;


