define(function(require) {
  'use strict';

  var KonamiCodeManager = function() {
    this._pattern = "38384040373937396665";
    this._keyCodeCache = '';
    this._callback = () => {};
    this._boundCheckKeyCodePattern = this._checkKeyCodePattern.bind(this);
  };

  KonamiCodeManager.prototype.attach = function(root, callback) {
    // TODO
    // not sure whether we should support multi-elements in this case
    if (root instanceof Element) {
      root.removeEventListener('keydown', this._boundCheckKeyCodePattern);
      root.addEventListener('keydown', this._boundCheckKeyCodePattern);
      this._callback = callback;
    }
  };

  KonamiCodeManager.prototype._checkKeyCodePattern = function(e) {
    if (e) {
      this._keyCodeCache += e.keyCode;
      if (this._keyCodeCache.length === this._pattern.length) {
        if (this._keyCodeCache === this._pattern) {
          console.log('KonamiCode passed, let\'s show some easter eggs :)');
          this._callback();
        }
        this._keyCodeCache = '';
      }
      else if (!this._pattern.match(this._keyCodeCache)) {
        this._keyCodeCache = '';
      }
    }
  };

  // Should be singleton
  return new KonamiCodeManager();
});
