function Defer() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

module.exports = function() {
  return new Defer();
};
