This is a minimal HTML5 game boilerplate / framework.
For making 2d keyboard controlled games.
Touch screen and gamepad are supported by mapping inputs to virtual key presses.

![Default title screen](./src/titlescreen.png)

HypeFrame takes care of the annoying boilerplate stuff so you can concentrate on the game.
You can use whatever game engine you like, including React or other web frameworks.

Here is a list of the stuff it takes care of:

 * Screens management (splash, title, settings, game screen).
 * Menus (normalized for keyboard and touch).
 * Play / restart button.
 * Controls (normalized for touch with arrow buttons).
 * CSS effects stylesheet.

HypeFrame uses browser capabilities wherever possible.
For example it uses native DOM elements and CSS instead of Canvas.