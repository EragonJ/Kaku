import Electron from 'electron';
import L10nManager from '../../modules/L10nManager';

const _ = L10nManager.get.bind(L10nManager);
const Remote = Electron.remote;
const TouchBar = Remote.TouchBar;
const App = Remote.app;
const BrowserWindow = Remote.BrowserWindow;

const {
  TouchBarButton,
  TouchBarSpacer
} = TouchBar;

class AppTouchBar {
  constructor() {
    L10nManager.on('language-changed', () => {
      this.destroy();
      this.build();
    });
  }

  build() {
    if (process.platform !== 'darwin') {
      return;
    }

    const mainWindow = Remote.getCurrentWindow();

    const playOrPauseButton = new TouchBarButton({
      label: _('touchbar_play_pause'),
      click: () => {
        mainWindow.webContents.send('key-MediaPlayPause');
      }
    });

    const playPreviousButton = new TouchBarButton({
      label: `◀ ${_('touchbar_play_previous_track')}`,
      click: () => {
        mainWindow.webContents.send('key-MediaPreviousTrack');
      }
    });

    const playNextButton = new TouchBarButton({
      label: `${_('touchbar_play_next_track')} ▶`,
      click: () => {
        mainWindow.webContents.send('key-MediaNextTrack');
      }
    });

    const touchbar = new TouchBar([
      new TouchBarSpacer({size: 'flexible'}),
      playPreviousButton,
      playOrPauseButton,
      playNextButton
    ]);

    mainWindow.setTouchBar(touchbar);
  }

  destroy() {
    if (process.platform !== 'darwin') {
      return;
    }

    const mainWindow = Remote.getCurrentWindow();
    mainWindow.setTouchBar();
  }
}

module.exports = new AppTouchBar();
