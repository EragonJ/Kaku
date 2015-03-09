define(function(require) {

  var React = require('react');
  var SearchbarSubmitButton = React.createClass({
    handleClick: function(event) {
      // TODO
    },
    render: function() {
      return (
        <button className="searchbar-user-input btn btn-info" onClick={this.handleClick}>
          Search
        </button>
      );
    }
  });

  return SearchbarSubmitButton;
});
