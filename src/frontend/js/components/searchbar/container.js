define(function(require) {
  'use strict';

  var Searcher = require('backend/Searcher');
  var TabManager = require('modules/TabManager');
  var React = require('react');

  var SearchbarContainer = React.createClass({
    getInitialState: function() {
      return {
        keyword: ''
      };
    },

    _onSubmit: function(event) {
      event.preventDefault();
      // Start to search
      var keyword = this.state.keyword;
      if (keyword) {
        // TODO we should change Searcher.search interface to make it more
        // readable, no one knows what does the *true* mean here
        Searcher.search(keyword, 30, true).then((results) => {
          TabManager.setTab('search');
        }, () => {
          // show error
        });
      }
    },

    _onInputChange: function(event) {
      this.setState({
        keyword: event.target.value
      });
    },

    render: function() {
      /* jshint ignore:start */
      return (
        <div className="searchbar-container">
          <form
            className="form-inline"
            onSubmit={this._onSubmit}>
              <div className="form-group">
                <input
                  tabIndex="1"
                  className="searchbar-user-input form-control"
                  onChange={this._onInputChange}
                  placeholder="Find something ..."/>
              </div>
          </form>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return SearchbarContainer;
});
