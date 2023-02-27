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
  // after the splash animation show the title screen
  $("#screen-splash").addEventListener("animationend", (ev) => {
    window.location.hash = "#screen-title";
  });
  normalizeBackButton();
  normalizeMenuNavigation();
  normalizeTouchUI();
  normalizeGamepad();
}

function normalizeBackButton() {
  // Listen out for "esc" key and go "back" as long as a screen is loaded
  window.addEventListener("keydown", (ev) => {
    console.log("key", ev.key, ev.code, ev.which, ev.keyCode);
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
}

function normalizeMenuNavigation() {
  // Listen out for arrow keys and turn them into menu nav
  window.addEventListener("keydown", (ev) => {
    if (window.location.hash != "#screen-game") {
      if (ev.key == "ArrowDown") {
        focusNextElement(1);
      }
      if (ev.key == "ArrowUp") {
        focusNextElement(-1);
      }
    }
  });
}

function normalizeTouchUI() {
  let useTouch = false;
  // If touches are detected turn on the touchscreen interface
  document.addEventListener("touchstart", (ev) => {
    useTouch = true;
    $(".touch-ui").style.display = "flex";
    // Normalize the touchscreen buttons
    
  });
}

// Turn gamepad events into key presses
function normalizeGamepad() {
  // listen for gamepads to make them readable
  window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected:", e);
    // light up the gamepad icon
    $(".icon-gamepad").classList.add("icon-active");
    // start up the gamepad poller
    setInterval(pollGamepads, 25);
  });
}

/*** gamepad functions ***/

const gamepadState = {};

const gpkeymap = {
  "h-1": ["ArrowLeft", 37],
  "h1": ["ArrowRight", 39],
  "v-1": ["ArrowUp", 38],
  "v1": ["ArrowDown", 40],

  "b0": ["Enter", 13],
  "b1": ["Delete", 46],
  "b2": ["Period", 190, false, "."],
  "b3": ["Slash", 191, false, "?"],
  "b4": ["Period", 190, false, "."],
  "b6": ["ArrowLeft", 37, true],
  "b7": ["ArrowRight", 39, true],

  "b9": ["Escape", 27],
  "b8": ["Enter", 13],
  "b11": ["Escape", 27],

  "b12": ["ArrowUp", 38],
  "b13": ["ArrowDown", 40],
  "b14": ["ArrowLeft", 37],
  "b15": ["ArrowRight", 39],
};

const gpbtns = [0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15];

// trigger arrow events from gamepad changes
function pollGamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  for (var i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp) {
      const newstate = {
        "h0": Math.round(gp.axes[6]),
        "v0": Math.round(gp.axes[7]),
        "h1": Math.round(gp.axes[0]),
        "v1": Math.round(gp.axes[1]),
        "b": gpbtns.map(i=>gp.buttons[i] && gp.buttons[i].pressed),
      };
      // console.log(newstate);
      // 0 = A
      // 1 = B
      // 3 = X
      // 4 = Y
      //
      // 6 = L
      // 7 = R
      //
      // 10 = select
      // 11 = start
      const oldstate = gamepadState[gp.id];
      if (oldstate) {
        /*
        if (JSON.stringify(oldstate) != JSON.stringify(newstate)) {
          console.log("gamepad", newstate);
        }
        */
        for (let ax=0; ax<2; ax++) {
          [["btn-left", "h" + ax, "btn-right"], ["btn-up", "v" + ax, "btn-down"]].map(tr => {
            if (newstate[tr[1]] != oldstate[tr[1]]) {
              const kname = tr[1][0];
              const key = gpkeymap[kname + newstate[tr[1]]];
              const keyold = gpkeymap[kname + oldstate[tr[1]]];
              if (newstate[tr[1]] == 0) {
                console.log("gamepad up", tr[1], newstate[tr[1]]);
                window.dispatchEvent(new KeyboardEvent("keyup", {"key": keyold[3] || keyold[0], "code": keyold[0], "keyCode": keyold[1]}));
              } else {
                if (key) {
                  console.log("gamepad down", tr[1], newstate[tr[1]]);
                  window.dispatchEvent(new KeyboardEvent("keydown", {"key": key[3] || key[0], "code": key[0], "keyCode": key[1]}));
                } else {
                  //console.log("gamepad down", tr[1], newstate[tr[1]], kname, key, keyold);
                }
              }
            }
          });
        }
        gpbtns.map((i,idx)=>{
          if (oldstate.b[idx] != newstate.b[idx]) {
            const key = gpkeymap["b" + i];
            if (key) {
              window.dispatchEvent(new KeyboardEvent(newstate.b[idx] ? "keydown" : "keyup", {"key": key[3] || key[0], "code": key[0], "keyCode": key[1], "altKey": key[2]}));
              // special case for enter button down (triggers click on selected element)
              if (newstate.b[idx] && key[0] == "Enter") {
                document.activeElement.click();
              }
            }
          }
        });
      }
      gamepadState[gp.id] = newstate;
      //console.log(newstate);
      //console.log("gamepad", gp.index, gp.id, gp.buttons, gp.axes);
      //console.log("Gamepad connected at index " + gp.index + ": " + gp.id +
      //  ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
      //gameLoop();
      //clearInterval(interval);
    }
  }
}

/*** helper functions ***/

function simulateKey(dir, key, keyCode) {
  document.dispatchEvent(
    new KeyboardEvent("key" + dir, {
      key: key,
      code: key, // put everything you need in this object.
      keyCode: keyCode, // example values.
      which: keyCode,
      shiftKey: false, // you don't need to include values
      ctrlKey: false,  // if you aren't going to use them.
      metaKey: false   // these are here for example's sake.
    })
  );
}

// Focus on the next focussable element on the page
// https://stackoverflow.com/a/35173443
function focusNextElement(amount) {
  //add all elements we want to include in our selection
  var focussableElements = 'button:not([disabled]):not([display=none]), a:not([disabled]):not([tabindex="-1"]):not([display=none]), input[type=text]:not([disabled]):not([tabindex="-1"]):not([display=none]), [tabindex]:not([disabled]):not([tabindex="-1"]):not([display=none])';
  //console.log("allFocussable", $$(focussableElements));
  if (document.activeElement) {
    var focussable = Array.prototype.filter.call(
      $$(focussableElements),
      function (element) {
        // check for visibility while always include the current activeElement
        return (
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement
        );
      }
    );
    //console.log("focussable", focussable);
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
