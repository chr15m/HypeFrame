/***
 Helper functions for HTML5 dom based games.
 ***/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function nonTopLevelScreen(hash) {
  return hash && hash != "#" && hash != "#screen-title";
}

/* Normalize various types of input (touch screen, keyboard, gamepad). */

function normalizeInputMethods() {
  let useTouch = false;

  // Listen out for "esc" key and go "back" as long as a screen is loaded
  document.addEventListener("keydown", (ev) => {
    if (ev.key == "Escape" && nonTopLevelScreen(window.location.hash)) {
      history.go(-1);
    }
  });
  // When the back button is pressed on Android don't go past the root level
  window.addEventListener('popstate', (ev) => {
    if (nonTopLevelScreen(window.location.hash)) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      history.go(1);
    }
  });
  // When the hash changes and it's a screen focus the visible button
  window.addEventListener('hashchange', (ev) => {
    if (nonTopLevelScreen(window.location.hash)) {
      focusNextElement(1);
    }
  });
  // If touches are detected turn on the touchscreen interface
  document.addEventListener("touchstart", (ev) => {
    useTouch = true;
    $(".touch-ui").style.display = "flex";
    // Normalize the touchscreen buttons
    
  });
  // Turn gamepad events into key presses
}

// TODO: function to change the play button to resume


// Focus on the next focussable element on the page
// https://stackoverflow.com/a/35173443
function focusNextElement(amount) {
  //add all elements we want to include in our selection
  var focussableElements = 'button:not([disabled]), a:not([disabled]):not([tabindex="-1"], input[type=text]:not([disabled]):not([tabindex="-1"]), [tabindex]:not([disabled]):not([tabindex="-1"])';
  console.log(document.querySelectorAll(focussableElements));
  if (document.activeElement) {
    var focussable = Array.prototype.filter.call(
      document.querySelectorAll(focussableElements),
      function (element) {
        // check for visibility while always include the current activeElement
        return (
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement
        );
      }
    );
    var index = focussable.indexOf(document.activeElement);
    if (index > -1) {
      const nextElement = focussable[(index + focussable.length + amount) % focussable.length] || focussable[0];
      nextElement.focus();
    } else {
      const nextElement = focussable[focussable.length - 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  }
}
