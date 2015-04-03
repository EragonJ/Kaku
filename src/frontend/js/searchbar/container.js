define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var YoutubeSearcher = require('backend/YoutubeSearcher');
  var React = require('react');

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
      if (keyword) {
        YoutubeSearcher.search(keyword, 10).then(function(results) {
          CoreData.set('searchResults', results);
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
              <input className="searchbar-user-input form-control" onChange={this.onInputChange} placeholder="Find something ..."/>
            </div>
          </form>
        </div>
      );
    }
  });

  return SearchbarContainer;
});
