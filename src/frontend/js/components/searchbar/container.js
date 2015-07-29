define(function(require) {
  'use strict';

  var ClassNames = require('classnames');
  var Constants = require('backend/modules/Constants');
  var Searcher = require('backend/modules/Searcher');
  var TabManager = require('modules/TabManager');
  var React = require('react');

  const SEARCH_TIMEOUT = 400;
  const BLUR_TIMEOUT = 100;

  var SearchbarContainer = React.createClass({
    getInitialState: function() {
      return {
        keyword: '',
        isSearching: false,
        selectedIndex: -1,
        searchTracks: []
      };
    },

    _searchTimer: null,

    _onSubmit: function(event) {
      event.preventDefault();
    },

    _onInputChange: function(event) {
      var keyword = event.target.value;
      this.setState({
        keyword: keyword
      });

      window.clearTimeout(this._searchTimer);
      this._searchTimer = window.setTimeout(() => {
        this._showLoader(true);
        Searcher.search(keyword, 10, false).then((tracks) => {
          // we have to reset selectedIndex for each search
          this.setState({
            searchTracks: tracks,
            selectedIndex: -1
          });
        }, (error) => {
          console.log(error);
        }).then(() => {
          this._showLoader(false);
        });
      }, SEARCH_TIMEOUT);
    },

    _onKeyDown: function(event) {
      var key = Constants.KEY_MAP[event.keyCode];
      switch (key) {
        case 'ARROW_UP':
          event.preventDefault();
          this._handleArrowKey('up');
          break;

        case 'ARROW_DOWN':
          event.preventDefault();
          this._handleArrowKey('down');
          break;

        case 'ESC':
          this._closeAutoCompleteList();
          break;

        case 'ENTER':
          this._doSelctAutoCompleteItem();
          break;
      }
    },

    _onBlur: function() {
      window.setTimeout(() => {
        this._closeAutoCompleteList();
      }, BLUR_TIMEOUT);
    },

    _showLoader: function(show) {
      if (show) {
        this.setState({
          isSearching: true
        });
      }
      else {
        this.setState({
          isSearching: false
        });
      }
    },

    _doSelctAutoCompleteItem: function() {
      var keyword;

      // TODO - we have to add a spinner in TabManager for this waiting
      // show UI first
      TabManager.setTab('search');

      // If users don't want to select options from AutoComplete list,
      // we will directly use the keyword from input and revoke the
      // search request
      if (this.state.selectedIndex === -1) {
        window.clearTimeout(this._searchTimer);
        keyword = this.state.keyword;
      }
      else if (this.state.selectedIndex >= 0) {
        var track = this.state.searchTracks[this.state.selectedIndex];
        keyword = track.title;
        this.setState({
          keyword: keyword
        });
      }

      this._closeAutoCompleteList();

      // then search
      Searcher.search(keyword, 30, true).catch((error) => {
        console.log(error);
      });
    },

    _onAutoCompleteItemClick: function() {
      this._doSelctAutoCompleteItem();
    },

    _onAutoCompleteItemMouseEnter: function(event) {
      var item = event.target;
      var index = parseInt(item.dataset.index, 10);
      this.setState({
        selectedIndex: index
      });
    },

    _closeAutoCompleteList: function() {
      this.setState({
        searchTracks: [],
        selectedIndex: -1
      });
    },

    _cleanSearchbar: function() {
      this.setState({
        keyword: ''
      });
    },

    _handleArrowKey: function(direction) {
      var searchTracks = this.state.searchTracks;
      if (!searchTracks.length) {
        return;
      }

      var index = this.state.selectedIndex;
      if (direction === 'up') {
        index --;
        if (index < -1) {
          index = searchTracks.length - 1;
        }
      }
      else {
        index ++;
        if (index > searchTracks.length - 1) {
          index = -1;
        }
      }

      this.setState({
        selectedIndex: index
      });
    },

    render: function() {
      var keyword = this.state.keyword;
      var selectedIndex = this.state.selectedIndex;
      var searchTracks = this.state.searchTracks;
      var isSearching = this.state.isSearching;

      var loaderClass = ClassNames({
        'loader': true,
        'show': isSearching
      });

      /* jshint ignore:start */
      return (
        <div className="searchbar-container">
          <form
            className="form-inline"
            onSubmit={this._onSubmit}>
            <div className="form-group">
              <span className={loaderClass}>
                <i className="fa fa-circle-o-notch fa-spin"></i>
              </span>
              <input
                tabIndex="1"
                className="searchbar-user-input form-control"
                onChange={this._onInputChange}
                onKeyDown={this._onKeyDown}
                onBlur={this._onBlur}
                value={keyword}
                placeholder="Find something ..."/>
            </div>
          </form>
          <ul className="autocomplete-list list-unstyled">
            {searchTracks.map((track, trackIndex) => {
              var className = ClassNames({
                'selected': trackIndex == selectedIndex
              });
              return <li
                className={className}
                onClick={this._onAutoCompleteItemClick}
                onMouseEnter={this._onAutoCompleteItemMouseEnter}
                data-index={trackIndex}>
                  {track.title}
              </li>;
            })}
          </ul>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return SearchbarContainer;
});
