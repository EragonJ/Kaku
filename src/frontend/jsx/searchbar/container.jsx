define(function(require) {

  var YoutubeSearcher = require('backend/YoutubeSearcher');

  var React = require('react');
  var SearchbarUserInput = require('components/searchbar/user-input');
  var SearchbarSubmitButton = require('components/searchbar/submit-button');

  var SearchbarContainer = React.createClass({
    onSubmit: function(event) {
      event.preventDefault();
    },
    render: function() {
      return (
        <div className="searchbar-container">
          <form className="form-inline" onSubmit={this.onSubmit}>
            <div className="form-group">
              <SearchbarUserInput/>
            </div>
            <SearchbarSubmitButton/>
          </form>
        </div>
      );
    }
  });

  return <SearchbarContainer/>;
});
