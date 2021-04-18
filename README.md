## About rikai-mpv

rikai-mpv is a port of rikaichamp Japanese dictionary and parser into [mpv video player](https://github.com/mpv-player/mpv).

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
