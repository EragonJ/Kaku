import Mdns from 'mdns-js';
import Player from './Player';
import { EventEmitter } from 'events';
import { Client, DefaultMediaReceiver } from 'castv2-client';
const Browser = Mdns.createBrowser(Mdns.tcp('googlecast'));

class CastingManager extends EventEmitter {
  constructor() {
    super();

    this.connected = false;
    this.services = new Map();
    this._initialized = false;
    this._client = null;
    this._castingPlayer = null;
    this._castingTrack = null;
  }

  init() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    Browser.on('ready', () => {
      Browser.discover();
    });

    Browser.on('update', (service) => {
      let address = service.addresses[0];
      this.services.set(address, {
        name: service.fullname || 'Unknown',
        address: address,
        port: service.port
      });
    });

    Player.on('seeked', () => {
      this.seek(Player.playingTrackTime);
    });

    Player.on('play', () => {
      this.play(Player.playingTrack);
    });

    Player.on('pause', () => {
      this.pause();
    });

    Player.on('stop', () => {
      this.stop();
    });
  }

  close() {
    this.connected = false;
    this._castingPlayer = null;
    if (this._client) {
      this._client = null;
    }
  }

  connect(address) {
    if (!address) {
      return;
    }

    this.emit('connecting');

    this._client = new Client();
    this._client.connect(address, () => {
      this._client.launch(DefaultMediaReceiver, (err, player) => {
        if (err) {
          console.log(err);
        }
        else {
          this._castingPlayer = player;
          this.connected = true;
          this.emit('connected');
        }
      });
    });

    this._client.on('close', () => {
      this.close();
    });

    this._client.on('error', (err) => {
      console.log('Error: %s', err.message);
      this.emit('error', err);
      this.close();
    });
  }

  _ready() {
    return !!this._castingPlayer;
  }

  play(track) {
    if (!this._ready()) {
      return;
    }

    if (this._castingTrack && track.isSameTrackWith(this._castingTrack)) {
      this.resume();
    }
    else {
      let media = {};
      media.contentId = track.platformTrackRealUrl;
      media.contentType = 'video/mp4';
      media.streamType = 'BUFFERED';
      media.metadata = {};
      media.metadata.title = track.title;
      media.metadata.images = [
        { url: track.covers.default }
      ];

      this._castingPlayer.on('status', (status) => {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      this._castingPlayer.load(media, {
        autoplay: true
      }, (err, status) => {
        console.log('media loaded playerState=%s', status.playerState);
      });

      this._castingTrack = track;
    }
  }

  pause() {
    if (!this._ready()) {
      return;
    }
    this._castingPlayer.pause();
  }

  resume() {
    if (!this._ready()) {
      return;
    }
    this._castingPlayer.play();
  }

  stop() {
    if (!this._ready()) {
      return;
    }
    this._castingPlayer.stop();
  }

  seek(time) {
    if (!this._ready()) {
      return;
    }
    this._castingPlayer.seek(time);
  }
}

module.exports = new CastingManager();
