## About rikai-mpv

rikai-mpv is a port of rikaichamp Japanese dictionary and parser into [mpv video player](https://github.com/mpv-player/mpv).

As for the graphical part, it takes inspiration from [interSubs](https://github.com/oltodosel/interSubs) script but has been completly rewritten for the Python side. 


https://user-images.githubusercontent.com/9808326/115159738-e1dea180-a094-11eb-84ab-4ade3e931785.mp4


## Dependencies

By default, rikai-mpv uses Noto Serif CJK JP Light font: https://www.google.com/get/noto/#serif-jpan . If you wish to use an other one, make sure to change it in `rikai_config.py`.

Dependencies are:

* `PyQt5`
* `QtWebEngineWidgets` (likely installed with `pip install PyQtWebEngine`, see [here](https://stackoverflow.com/a/54947671/4370080))
* `node >=v14.16`

## Install

Currently, the script supports **Linux only**. It is likely to not work with Wayland-based display and has been designed for X. You can install as follows:

Clone in your `mpv/scripts` folder (the install will break elsewhere):

```
cd ~/.config/mpv/scripts/
git clone https://github.com/fxmarty/rikai-mpv.git
```

Add a symlink at the top of the `scripts` directory for mpv to detect it:
```
ln -s rikai-mpv/front.lua .
```

If necessary, modify `rikai_config.py` to fit your needs. The available options are limited right now and should be expended.

## Build

If you wish to do modifications to the TypeScript side, make sure to have installed `typescript` and `yarn` system-wide and do as follows in `rikaichamp-backend`:

```
yarn install
```

Modifications will be applied to rikai-mpv after compiling TypeScript into JavaScript with `tsc`, as rikai-mpv uses plain JavaScript with node.js.

## Under the hood

The port of rikaichamp `rikaichamp-backend` is more or less [v0.3.5.0](https://github.com/birtles/rikaichamp/releases/tag/v0.3.5). Everything related to the browser has been removed so that the parser is node-friendly. Note however that the popup HTML is still built with rikaichamp (using [jsdom](https://github.com/jsdom/jsdom)), and that it is still a web rendering that happens under the hood in Qt with a `QWebEngineView` instance for the popup.

Compared to interSubs, the subtitle rendering uses `QTextEdit` instead of `QLabel`, which offers much more flexibility. Notably, interSubs was not fit for Japanese parsing, as it relies on spaces between words to query a dictionary. This implementation should be more flexible if it were to be merged into interSubs, as it allows parsing as many characters as needed, not just separated by blanks (e.g. interSubs could not parse "living room" as a single word). It is a strong limitation as it could not parse e.g. also Chinese or Thai.
