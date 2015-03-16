define(function(require) {

  // We can extend more functionalities here

  var BaseModule = function(constructor) {
    this._debug = false;
  };

  BaseModule.prototype = {
    debug: function(errorMessage) {
      if (this._debug) {
        console.error('[' + this._name + '] - ' + errorMessage);
      }
    }
  };

  var _create = function(constructor) {
    var ModuleFunc = function() {};
    ModuleFunc.prototype = Object.create(BaseModule.prototype);
    ModuleFunc.prototype._name = constructor && constructor.name || '';

    var Module = function() {
      var instance = new ModuleFunc();
      if (typeof constructor === 'function') {
        constructor.apply(instance, arguments);
      }
      return instance;
    };

    Module.prototype = ModuleFunc.prototype;
    return Module;
  };

  return _create;
});
