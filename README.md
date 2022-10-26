## About rikai-mpv

rikai-mpv is a port of [rikaichamp](https://github.com/birtles/rikaichamp) Japanese dictionary and parser into [mpv](https://github.com/mpv-player/mpv) video player.

As for the graphical part, it takes inspiration from [interSubs](https://github.com/oltodosel/interSubs) script but has been largely rewritten for the Python side. 


https://user-images.githubusercontent.com/9808326/115159800-2d914b00-a095-11eb-81cc-18a63eff74e7.mp4

Pieces of code are also borrowed from [normal-jp](https://github.com/birchill/normal-jp) and [hikibiki-data](https://github.com/birchill/hikibiki-data).

## Dependencies

By default, rikai-mpv uses Noto Serif CJK JP Light font: https://www.google.com/get/noto/#serif-jpan . If you wish to use an other one, make sure to change it in `rikai_config.py`.

Dependencies are:

* Linux OS with X-based display
* `python >=3.8.5`
* `PyQt5 >=5.9.2`
* `QtWebEngineWidgets` (likely installed with `pip install PyQtWebEngine`, see [here](https://stackoverflow.com/a/54947671/4370080))
* `node >=v14.16`
* `typescript` (install with `npm install --global typescript`)
* `yarn` (install with `npm install --global yarn`)
* `socat`

rikai-mpv may work with different versions, but has not been tested. A port into Windows should be doable, although we rely on Unix sockets for lua <--> python <--> node.js communication.

## Install

Currently, the script supports **Linux only**. It has not been tested for Wayland-based display and has been designed for X11. You can install as follow:

Clone in your `mpv/scripts/` folder (the install will break elsewhere):

```
cd ~/.config/mpv/scripts/
git clone https://github.com/fxmarty/rikai-mpv.git
```

Add a symlink at the top of the `scripts` directory for mpv to detect it:
```
ln -s rikai-mpv/front.lua .
```

Then, go to `rikai-mpv/rikai-backend/` and run:

```
yarn install
tsc
```

This is to install necessary dependencies, and compile typescript source into javascript.

If necessary, modify `rikai_config.py` to fit your needs. The available options are limited right now and should be expended. In particular, if you use several screens, **set `n_screen` as a number corresponding to the screen you want the subtitles to be displayed on.**

On KDE (kwin), go to Compositor settings and uncheck "Allow applications to block compositing". This is necessary to allow transparency. [Screenshot](https://iwf1.com/wordpress/wp-content/uploads/2017/09/Disable-applications-override-compositor-KDE.jpg).

## Key bindings

* `F5` start rikai-mpv. Starting may take several seconds.
* `F7` stop rikai-mpv
* With the mouse on a subtitle, *left* click then `Ctrl + Alt + UP` / `Ctrl + Alt + DOWN` to zoom/dezoom the subtitles
* With the mouse on a subtitle, *right* click then `Ctrl + Alt + UP` / `Ctrl + Alt + DOWN` to zoom/dezoom the popup
* Popups are scrollable in case they don't fit in screen.

On top of these bindings, mpv's built-in hotkeys for going to next/previous subtitle may prove useful:
```
# to add in ~/.config/mpv/input.conf
LEFT        no-osd sub-seek -1  # previous subtitle
RIGHT       no-osd sub-seek +1  # next subtitle
```

## Important notes

* rikai-mpv is by default active **only in full screen mode**.
* rikai-mpv overrides the settings set for subtitles styling in `mpv.conf`. You may wish to edit `rikai_config.py` to fit your needs.
* rikai-mpv used to work with a secondary sid (e.g. in English) with mpv 0.29.1 (when activated at least once before turning on rikai-mpv), but does not with recent versions of mpv. A solution should be found, see https://github.com/mpv-player/mpv/issues/9175 for more information.
* `rikaichamp-backend` is not a complete port of rikaichamp features, as it (mainly) lacks support for automatic updates of the dictionary files and support for kanji dictionaries.

## Build

If you wish to do modifications to the TypeScript side, make sure to have installed `typescript` and `yarn` system-wide and do as follows in `rikaichamp-backend`:

```
yarn install
```

Modifications will be applied to rikai-mpv after compiling TypeScript into JavaScript with `tsc`, as rikai-mpv uses plain JavaScript with node.js.

## Known issues

Outlining text in Qt is tricky. The current solution may well break repainting of the subtitles, and a better solution is welcome if found. If repainting of subtitles is broken (e.g. only some part is showing, or it is not showing at all even though the semi-transparent background is showing), the culprit is most likely here: https://github.com/fxmarty/rikai-mpv/blob/main/subtitles_popup_graphics.py#L452

## Under the hood

The port of rikaichamp `rikaichamp-backend` is more or less [v0.3.5](https://github.com/birtles/rikaichamp/releases/tag/v0.3.5). Everything related to the browser has been removed so that the parser is node-friendly. Note however that the popup HTML is still built with rikaichamp (using [jsdom](https://github.com/jsdom/jsdom)), and that it is still a web rendering that happens under the hood in Qt with a `QWebEngineView` instance for the popup.

Compared to interSubs, the subtitle rendering uses `QTextEdit` instead of `QLabel`, which offers much more flexibility. Notably, interSubs was not fit for Japanese parsing, as it relies on spaces between words to query a dictionary. This implementation should be more flexible if it were to be merged into interSubs, as it allows parsing as many characters as needed and not just separated by blanks, e.g. interSubs could not parse "living room" as a single word, and could also not parse languages such as Chinese or Thai.

A great thanks to [birtles](https://github.com/birtles) for helping me to get through rikaichamp's code!

## License

The code borrowed from rikaichamp and modified is published under GNU v3 license. The rest of the code base is published under the MIT license.
