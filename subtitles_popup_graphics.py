#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import subprocess

import time

from json import loads

from PyQt5 import QtWebEngineWidgets
from PyQt5.QtCore import Qt, QThread, QObject, QSize, QPointF
from PyQt5.QtCore import pyqtSignal, pyqtSlot
from PyQt5.QtCore import QUrl, QPoint, QRect
from PyQt5.QtWidgets import QTextEdit, QFrame, QApplication

from PyQt5.QtGui import QTextCursor, QFont, QPainter, QPen, QColor
from PyQt5.QtWidgets import QVBoxLayout, QHBoxLayout

import math

import socket

import warnings

pth = os.path.expanduser('~/.config/mpv/scripts/')
os.chdir(pth)
import rikai_config as config

# the import below is extremely useful to debug events by printing their type
# with `print(event_lookup[str(event.type())])`
# from event_lookup import event_lookup


def sign(x):
    if x >= 0:
        return 1
    else:
        return -1


def mpv_pause():
    os.system('echo \'{ "command": ["set_property", "pause", true] }\' | socat - "' + mpv_socket + '" > /dev/null')


def mpv_resume():
    os.system('echo \'{ "command": ["set_property", "pause", false] }\' | socat - "'
              + mpv_socket + '" > /dev/null')


def mpv_pause_status():
    stdoutdata = subprocess.getoutput(
            'echo \'{ "command": ["get_property", "pause"] }\' | socat - "' + mpv_socket + '"')
    
    try:
        return loads(stdoutdata)['data']
    except Exception:
        return mpv_pause_status()


def mpv_fullscreen_status():
    stdoutdata = subprocess.getoutput('echo \'{ "command": ["get_property", "fullscreen"] }\' | socat - "'
                                      + mpv_socket + '"')
    try:
        return loads(stdoutdata)['data']
    except Exception:
        return mpv_fullscreen_status()


class thread_subtitles(QObject):
    update_subtitles = pyqtSignal(bool, str)
    
    @pyqtSlot()
    def main(self):
        subs = ""
        hidden = True
        check_time_fullscreen = 0.1
        
        inc = 0
        assert check_time_fullscreen > config.update_time
        ratio = int(check_time_fullscreen / config.update_time)
        
        tmp_file_subs = ''
        
        while 1:
            time.sleep(config.update_time)
            
            # hide subs when mpv isn't in focus or in fullscreen
            if inc > ratio:
                inc = 0
                if mpv_fullscreen_status():
                    hidden = False
                else:
                    if hidden is not True:  # no need to emit if already hidden
                        hidden = True
                        self.update_subtitles.emit(True, tmp_file_subs)
            inc += 1
            
            if not hidden:
                try:
                    tmp_file_subs = open(sub_file).read()
                except Exception:
                    continue
                
                if tmp_file_subs != subs:
                    self.update_subtitles.emit(False, tmp_file_subs)
                    
                    subs = tmp_file_subs


class Popup(QtWebEngineWidgets.QWebEngineView):
    def __init__(self, parent=None):
        super(QtWebEngineWidgets.QWebEngineView, self).__init__()
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        webEnginePage = self.page()
        webEnginePage.setBackgroundColor(Qt.transparent)
        
        self.setWindowFlags(Qt.X11BypassWindowManagerHint)
        
        self.zoom_rate = parent.parent.config.default_zoom_popup
        self.setZoomFactor(self.zoom_rate)
        
        self.html_path = os.path.join(os.path.expanduser('~/.config/mpv/scripts/'),
                                      'rikai-mpv/rikaichamp-backend/web_page/my_attempt.html')
        
        # used for rounding when rezooming
        self.last_round = 1
        
        # used to keep track of zoom changes
        self.zoom_timed = 0
        
        # this record the vertical scrolling in the popup
        self.scroll_y = 0
        
    def change_zoom(self, event):
        # Ctrl+Alt+"+" or Ctrl+Alt+"-" for zooming
        if ((event.modifiers() & Qt.ControlModifier)
                and (event.modifiers() & Qt.AltModifier)):
            proceed_zooming = False
            if event.key() == Qt.Key_Up and self.zoom_rate < 2:
                proceed_zooming = True
                up_or_down = 1
                
            if event.key() == Qt.Key_Down and self.zoom_rate > 0.3:
                proceed_zooming = True
                up_or_down = -1
            
            if proceed_zooming is True:
                self.zoom_rate = self.zoom_rate + up_or_down * 0.05
                self.zoom_timed = self.zoom_timed + up_or_down
                
                self.setZoomFactor(self.zoom_rate)
                
                new_width = self.width() + up_or_down * self.base_width * 0.05
                new_height = self.height() + up_or_down * self.base_height * 0.05
                
                new_width_int, new_height_int = self.round_up_down(new_width, new_height)

                self.move(self.pos().x(),
                          self.pos().y() + self.height() - new_height_int)
                
                self.resize(new_width_int, new_height_int)
    
    # this function is needed because depending on the rounding we apply and if the zoom
    # is changed many times, we may encounter unexpected position / size.
    def round_up_down(self, x, y):
        if self.last_round == -1:
            self.last_round = 1
            return math.ceil(x), math.ceil(y)
        else:
            self.last_round = -1
            return math.floor(x), math.floor(y)


class TextWidget(QTextEdit):
    def __init__(self, parent=None):
        super().__init__()
        
        self.setMouseTracking(True)
        self.setReadOnly(True)
        self.setCursorWidth(0)
        
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        self.setAlignment(Qt.AlignVCenter)
        
        self.setLineWrapMode(QTextEdit.LineWrapMode.NoWrap)
        
        self.document().setDocumentMargin(0)
        self.setContentsMargins(0, 0, 0, 0)
        
        self.verticalScrollBar().setEnabled(False)
        self.horizontalScrollBar().setEnabled(False)
        
        self.n_lines = 1
        
        self.text = ""
        
        self.previous_lookup = ""
        
        self.parent = parent
        self.pos_parent = QPoint(0, 0)
        
        self.popup = Popup(self)
        self.popup.move(self.parent.config.x_screen, self.parent.config.y_screen)
        self.popup.resize(800, 800)
        
        font = self.currentFont()
        font.setPointSize(self.parent.config.default_font_point_size)
        font.setStyleStrategy(QFont.StyleStrategy.PreferAntialias)
        self.setFont(font)
        
        self.render_ready = 0
        
        self.released = True
        
        # `True` corresponds to the case where there is currently no popup being shown
        self.no_popup = True
        
        self.transparent_pen = QPen(Qt.transparent)
        self.outline_pen = QPen(Qt.black, 8)
        
        # whether or not the cursor is on the QTextEdit
        self.already_in = False
        
        # index of the character the mouse is on when popup is to be shown
        self.char_index_popup = -1
        
        # number of characters to highlight when the popup is shown
        self.length_highlight = 0
        
        # execution after the html of the popup has been loaded
        self.popup.loadFinished.connect(self.after_popup_loaded)
        
        self.popup_showing_ready = True
        
        # set to True when a warning message to show only once has been shown
        self.warning_message_unique_shown = False
        
    def after_popup_loaded(self, arg):
        self.popup.page().runJavaScript(
                    """
                    try {
                    document.getElementById('rikaichamp-window').scrollWidth;
                    }
                    catch(err) {
                        err.message;
                    }
                    """,
                    self.callback_popup_width)
        
        self.popup.page().runJavaScript(
                    """
                    try {
                    document.getElementById('rikaichamp-window').scrollHeight;
                    }
                    catch(err) {
                        err.message;
                    }
                    """,
                    self.callback_popup_height)
    
    def callback_popup_height(self, new_height):
        if new_height != "Cannot read property 'scrollHeight' of null":
            self.popup.base_height = new_height
            
            self.popup_showing_ready = True  # From here, we don't care about the .html file
            
            self.show_popup()
        else:
            warnings.warn('Popup page loading has failed and this should not happen.'
                          + ' Please fill a bug report if this gets inconvenient.',
                          stacklevel=2)
    
    def callback_popup_width(self, new_width):
        if new_width != "Cannot read property 'scrollHeight' of null":
            self.popup.base_width = new_width
        else:
            warnings.warn('Popup page loading has failed and this should not happen.'
                          + ' Please fill a bug report if this gets inconvenient.',
                          stacklevel=2)
    
    def show_popup(self):
        if self.already_in:  # it could be that we exited the subtitles before getting there
            # we need this to take into account the zoom setting previously set
            
            width = self.popup.base_width * (self.parent.config.default_zoom_popup
                                             + 0.05 * self.popup.zoom_timed) + 5
            height = self.popup.base_height * (self.parent.config.default_zoom_popup
                                               + 0.05 * self.popup.zoom_timed) + 5
            
            # the pop up is shown above the subtitles, and it should not excess the
            # available space there, namely `self.pos_parent.y()`
            height = min(self.pos_parent.y(), height)
            
            width = int(width)
            height = int(height)
            
            char_index = self.char_index_popup
            self.set_text_selection(char_index, char_index + self.length_highlight)
            
            rect = self.cursorRect(self.textCursor())
            
            # absolute coordinate of the top left of the current selection
            cursor_top = self.viewport().mapToGlobal(QPoint(rect.left(), rect.top()))
            
            x_screen = self.parent.config.x_screen
            x_popup = (cursor_top.x()
                       - self.fontMetrics().width(self.text[char_index:char_index
                                                            + self.length_highlight])
                       + self.fontMetrics().width(self.text[char_index]) // 4)
            
            # make sure we don't go out of the screen
            if x_popup + width >= (x_screen + self.parent.config.screen_width):
                x_popup = x_screen + self.parent.config.screen_width - width
            
            y_popup = max(0, self.pos_parent.y() - height)
            
            # we need to be careful to never cover the QTextEdit when changing popup
            if self.popup.height() > height:
                self.popup.resize(width, height)
                self.popup.move(x_popup, y_popup)
            else:
                self.popup.move(x_popup, y_popup)
                self.popup.resize(width, height)
            
            self.popup.show()
            
        self.no_popup = True
        
    def mouseMoveEvent(self, event):
        point_position = event.pos()  # this is relative coordinates in the QTextEdit
        char_index = self.document().documentLayout().hitTest(
            QPointF(point_position.x(), point_position.y()),
            Qt.HitTestAccuracy.ExactHit)
        
        if (self.text[char_index:] != self.previous_lookup
                and 0 <= char_index
                and char_index < self.len_text):
            
            self.previous_lookup = self.text[char_index:]
            self.setUpdatesEnabled(True)  # we needs updates for highlighting text
            self.no_popup = False  # a popup is likely to be shown, disable highlighting
            
            # print('Looking up', self.text[char_index:], '...')
            
            client.send(self.text[char_index:].encode())
            
            data_received = None
            while True:  # this is subideal and should probably be in in a separate thread
                data_received = client.recv(1024)
                
                decoded_data = data_received.decode()
                
                if decoded_data.startswith('ready'):  # node has finished its processing
                    nb_highlight = int(decoded_data[5:])  # the beginning is 'ready'

                    if nb_highlight == -1:  # e.g., the popup is empty
                        show_popup = False
                        self.popup.hide()  # hide it in case it was already shown
                        self.set_text_selection(0, 0)
                    else:
                        show_popup = True
                        self.length_highlight = nb_highlight
                    
                    break
            
            if show_popup is True:
                self.popup.scroll_y = 0
                self.char_index_popup = char_index
                self.popup_reset = True
                
                # this resize is "needed" as I could so far not set the width of
                # the popup no matter the size of the window. We make it bigger so that
                # the `scrollWidth` value we get later makes sense
                resize_value = (self.parent.config.x_screen
                                + self.parent.config.screen_width - self.popup.pos().x())
                self.popup.resize(resize_value, self.popup.height())
                
                # this show is needed to record later on the right size of the popup
                # in case it was not shown already
                self.popup.show()
                
                if self.popup_showing_ready:
                    self.popup_showing_ready = False
                    self.popup.load(QUrl.fromLocalFile(self.popup.html_path))
                else:
                    # the previous .html file is still being used, which is typically
                    # the case when the mouse moves too fast. This is really subideal and
                    # an other solution should be found to avoid reading and writing .html
                    # files at the same time...
                    if not self.warning_message_unique_shown:
                        warnings.warn('Ignore this popup showing as it is likely to fail.'
                                      + ' Please fill a bug report if this gets inconvenient.'
                                      + " This warning won't be shown again.",
                                      stacklevel=2)
                        self.warning_message_unique_shown = True
                    pass
    
    def enterEvent(self, event):
        # the case where this event is triggered several times has been encountered,
        # hence the `self.already_in`
        if not self.already_in:
            self.already_in = True
            self.setUpdatesEnabled(True)
            self.previously_paused = mpv_pause_status()
            mpv_pause()
        
        super().enterEvent(event)
    
    def leaveEvent(self, event):
        if not self.previously_paused:
            mpv_resume()
        
        self.already_in = False
        
        self.setUpdatesEnabled(True)
        
        # reset selection
        self.set_text_selection(0, 0)
        
        # reset it in case we want to look back at the same position
        self.previous_lookup = ""
        
        # hiding popup in case it was shown
        self.popup.hide()
        
        super().leaveEvent(event)
    
    def mousePressEvent(self, event):
        # we want to zoom in/out the popup, but set focus to this QTextEdit because
        # I could not redirect properly the keyPress events to the popup
        if event.button() == Qt.MouseButton.RightButton:
            self.activateWindow()
            self.setFocus()
        
        # we want to set focus to the parent frame, to likely zoom in/out the subtitles
        elif event.button() == Qt.LeftButton:
            super().mousePressEvent(event)
            self.parent.activateWindow()
            self.parent.setFocus()
        else:
            pass
    
    def keyPressEvent(self, event):  # this should handle only the popup zoom
        self.popup.change_zoom(event)
        super().keyPressEvent(event)
    
    # we do not want the context menu to display and steal focus
    def contextMenuEvent(self, event):
        pass
    
    def paintEvent(self, event):
        # this is just a trick to avoid an infinite loop due to the painting of the
        # outline, as the line `my_cursor.select(QTextCursor.SelectionType.Document)`
        # triggers a recursive call to `paintEvent`
        self.render_ready += 1
        
        if self.render_ready > 3 and self.no_popup:
            self.setUpdatesEnabled(False)
        
        # Showing the outline is really slow (at times, more than 100 ms) and
        # we do not want to do it when the user shows popups, as it slows everything down.
        # Ideally, it could probably be in a separate thread.
        if not self.already_in:
            painter = QPainter(self.viewport())
            
            my_cursor = self.textCursor()
            my_char_format = my_cursor.charFormat()
            
            my_char_format.setTextOutline(self.outline_pen)
            
            my_cursor.select(QTextCursor.SelectionType.Document)
            my_cursor.mergeCharFormat(my_char_format)
            
            self.document().drawContents(painter)
            
            my_char_format.setTextOutline(self.transparent_pen)
            my_cursor.mergeCharFormat(my_char_format)
        
        super().paintEvent(event)
        
    # wheel events are unfortunately captured by the QTextEdit, but should be redirected
    # to the popup in case the entries take too much place
    def wheelEvent(self, event):
        # reasonable scroll policy. Note however that system-wide pad up/down movement
        # setting may not apply and has not been tested
        self.popup.scroll_y = (- sign(event.angleDelta().y())
                               * self.parent.config.screen_height / 15)
        
        script = f"window.scrollTo(0, document.scrollingElement.scrollTop + {self.popup.scroll_y});"
        self.popup.page().runJavaScript(script)
        
    def minimumSizeHint(self):
        return QSize(5, 5)
        
    def set_text_selection(self, start, end):
        cursor = self.textCursor()
        cursor.setPosition(start)
        cursor.setPosition(end, QTextCursor.KeepAnchor)
        self.setTextCursor(cursor)


class ParentFrame(QFrame):
    def __init__(self, config):
        super().__init__()
        
        self.thread_subs = QThread()
        self.obj = thread_subtitles()
        self.obj.update_subtitles.connect(self.render_subtitles)
        self.obj.moveToThread(self.thread_subs)
        self.thread_subs.started.connect(self.obj.main)
        self.thread_subs.start()
        
        self.config = config
        
        self.setWindowFlags(Qt.X11BypassWindowManagerHint)
        
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setStyleSheet(config.style_subs)
        
        self.subtext = TextWidget(parent=self)
        
        self.subtitles_vbox = QVBoxLayout(self)
        self.subtitles_vbox.addStretch()
        self.v_margin = 0
        self.subtitles_vbox.setContentsMargins(0, self.v_margin, 0, self.v_margin)
        
        hbox = QHBoxLayout()
        hbox.addWidget(self.subtext)
        
        self.subtitles_vbox.addLayout(hbox)
        self.subtitles_vbox.addStretch()
        
        # we add some pixels to the semi-transparent background, up and down
        self.stretch_pixels = 20
    
    def render_subtitles(self, to_hide, text):
        # print("-------")
        # print("Input: `" + text + "`")
        self.subtext.render_ready = 0
        
        if to_hide or not len(text):
            try:
                self.subtext.clear()
                self.hide()
            finally:
                return

        self.subtext.setUpdatesEnabled(True)
        self.subtext.clear()
        self.repaint()
        
        self.subtext.setAlignment(Qt.AlignCenter)  # this should be before .show()
        self.show()

        subs2 = text
        
        subs2 = subs2.split('\n')
        for i in range(len(subs2)):
            subs2[i] = subs2[i].strip()
            subs2[i] = " " + subs2[i] + " "
        
        subs2 = '\n'.join(subs2)
        
        self.subtext.len_text = len(subs2)
        self.subtext.text = subs2
        self.subtext.text_splitted = subs2.split('\n')
        self.subtext.n_lines = len(self.subtext.text_splitted)
        
        # the longest line is not necessarily the one with the most characters
        # as we may use non-monospace fonts
        width_subtext = 0
        for line in self.subtext.text_splitted:
            width_subtext = max(width_subtext,
                                self.subtext.fontMetrics().boundingRect(
                                    QRect(),
                                    Qt.AlignCenter,
                                    line).width()
                                + 4)
        
        height_subtext = self.subtext.fontMetrics().height() * self.subtext.n_lines + 4
        
        width = width_subtext
        height = height_subtext + self.stretch_pixels
        
        x = (self.config.screen_width / 2) - (width / 2)
        y = self.config.screen_height - height - config.bottom_spacing_pixels
        
        self.setGeometry(config.x_screen + int(x),
                         config.y_screen + int(y),
                         width, height)
        
        self.subtext.setGeometry(0, self.stretch_pixels // 2,
                                 width_subtext, height_subtext)
        
        for line in self.subtext.text_splitted:
            self.subtext.append(line)
        
        self.subtext.pos_parent = self.pos()
        
        self.subtext.render_ready += 1
    
    def keyPressEvent(self, event):
        self.subtext.setUpdatesEnabled(True)
        
        # Ctrl+Alt+"+" or Ctrl+Alt+"-" for zooming
        if ((event.modifiers() & Qt.ControlModifier)
                and (event.modifiers() & Qt.AltModifier)):
            
            # check if non-zero later, and act accordingly
            resized = 0
            
            if event.key() == Qt.Key_Up:
                resized = 2
            if event.key() == Qt.Key_Down:
                resized = -2
            
            if resized != 0:
                self.subtext.render_ready = 0
                
                font = self.subtext.currentFont()
                font.setPointSize(font.pointSize() + resized)
                self.subtext.setFont(font)
                
                width_subtext = 0
                for line in self.subtext.text_splitted:
                    width_subtext = max(width_subtext,
                                        self.subtext.fontMetrics().boundingRect(
                                                                    QRect(),
                                                                    Qt.AlignCenter,
                                                                    line).width()
                                        + 4)
                height_subtext = (self.subtext.fontMetrics().height()
                                  * self.subtext.n_lines + 4)
                
                width = width_subtext
                height = height_subtext + self.stretch_pixels
                
                x = (self.config.screen_width / 2) - (width / 2)
                y = self.config.screen_height - height - config.bottom_spacing_pixels
                
                self.setGeometry(config.x_screen + int(x),
                                 config.y_screen + int(y),
                                 width, height)
                
                self.subtext.setGeometry(0, self.stretch_pixels // 2,
                                         width_subtext, height_subtext)

                self.subtext.pos_parent = self.pos()
                
                self.subtext.render_ready += 1
    
    def paintEvent(self, event):
        if self.subtext.render_ready >= 1:
            p = QPainter(self)
            p.fillRect(event.rect(), QColor(0, 0, 0, 128))
        
        super().paintEvent(event)


if __name__ == "__main__":
    print('[rikai-mpv] Starting rikai-mpv in python...')
    
    mpv_socket = sys.argv[1]
    sub_file = sys.argv[2]
    # sub_file = '/tmp/mpv_sub_'
    # mpv_socket = '/tmp/mpv_socket_'
    
    # the `mpv_socket` at the end is just a trick to handle termination in lua,
    # so that we can find the node process with `pkill` or `pgrep`
    command = ('node '
               + os.path.join(os.path.expanduser('~/.config/mpv/scripts/'),
                              'rikai-mpv/rikaichamp-backend/extension/background_search_html.js')
               + ' '
               + mpv_socket)
    
    command_splitted = command.split(' ')
    
    print("Launching node.js backend...")
    subprocess.Popen(command_splitted, shell=False)

    print("Connecting from Python...")
    while True:
        try:
            client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            client.connect(os.path.join(os.path.expanduser('~/.config/mpv/scripts/'),
                                        "rikai-mpv/my_socket"))
        except Exception:
            time.sleep(0.1)
            continue
        break
    print("python <---> node.js socket connected.")
    
    app = QApplication(sys.argv)
    
    config.screen_width = app.screens()[config.n_screen].size().width()
    config.screen_height = app.screens()[config.n_screen].size().height()
    config.x_screen = app.screens()[config.n_screen].geometry().x()
    config.y_screen = app.screens()[config.n_screen].geometry().y()
    
    form = ParentFrame(config)
    form.show()
    app.exec_()
