define(function(require) {

  var YoutubeSearcher = require('backend/YoutubeSearcher');

  var React = require('react');
  var SearchbarUserInput = require('searchbar/user-input');
  var SearchbarSubmitButton = require('searchbar/submit-button');

  var SearchbarContainer = React.createClass({
    getInitialState: function() {
      return {
        keyword: ''
      };
    },
    onSubmit: function(event) {
      event.preventDefault();
      // Start to search
      var keyword = this.state.keyword;
      if (!keyword) {
        YoutubeSearcher.search(keyword, 10).then(function(results) {
          console.log(results);
        }, function() {
          // show error
        });
      }
    },
    onInputChange: function(event) {
      this.setState({
        keyword: event.target.value
      });
    },
    render: function() {
      return (
        <div className="searchbar-container">
          <form className="form-inline" onSubmit={this.onSubmit}>
            <div className="form-group">
              <SearchbarUserInput onChange={this.onInputChange}/>
            </div>
            <SearchbarSubmitButton/>
          </form>
        </div>
      );
    }
  });

  return <SearchbarContainer/>;
});
