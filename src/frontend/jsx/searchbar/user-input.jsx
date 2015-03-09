define(function(require) {

  var React = require('react');
  var SearchbarUserInput = React.createClass({
    handleChange: function(event) {
      // TODO
      // add autocomplete here
    },
    render: function() {
      return (
        <input className="searchbar-user-input form-control" onChange={this.handleChange} placeholder="Find something ...">
        </input>
      );
    }
  });

  return SearchbarUserInput;
});
