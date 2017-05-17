import React, { Component } from 'react';
import ClassNames from 'classnames';
import Constants from '../../../modules/Constants';
import Searcher from '../../../modules/Searcher';
import TabManager from '../../modules/TabManager';

const SEARCH_TIMEOUT = 400;
const SEARCH_LIMIT_FOR_AUTO_COMPLETE = 10;
const SEARCH_LIMIT_FOR_ALL = 50;
const BLUR_TIMEOUT = 100;

class SearchbarComponent extends Component {
  constructor() {
    super();

    this.state = {
      keyword: '',
      isSearching: false,
      selectedIndex: -1,
      searchTracks: []
    };

    this._searchTimer = null;
    this._onSubmit = this._onSubmit.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._showLoader = this._showLoader.bind(this);
    this._doSelctAutoCompleteItem = this._doSelctAutoCompleteItem.bind(this);
    this._onAutoCompleteItemClick = this._onAutoCompleteItemClick.bind(this);
    this._onAutoCompleteItemMouseEnter = this._onAutoCompleteItemMouseEnter.bind(this);
    this._closeAutoCompleteList = this._closeAutoCompleteList.bind(this);
    this._cleanSearchbar = this._cleanSearchbar.bind(this);
    this._handleArrowKey = this._handleArrowKey.bind(this);
  }

  _onSubmit(event) {
    event.preventDefault();
  }

  _onInputChange(event) {
    let keyword = event.target.value;
    this.setState({
      keyword: keyword
    });

    window.clearTimeout(this._searchTimer);
    this._searchTimer = window.setTimeout(() => {
      this._showLoader(true);
      Searcher.search(keyword, SEARCH_LIMIT_FOR_AUTO_COMPLETE, false)
        .then((tracks) => {
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
  }

  _onKeyDown(event) {
    let key = Constants.KEY_MAP[event.keyCode];
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
  }

  _onBlur(event) {
    window.setTimeout(() => {
      this._closeAutoCompleteList();
    }, BLUR_TIMEOUT);
  }

  _showLoader(show) {
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
  }

  _doSelctAutoCompleteItem() {
    let keyword;

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
      let track = this.state.searchTracks[this.state.selectedIndex];
      keyword = track.title;
      this.setState({
        keyword: keyword
      });
    }

    this._closeAutoCompleteList();

    // then search
    Searcher.search(keyword, SEARCH_LIMIT_FOR_ALL, true).catch((error) => {
      console.log(error);
    });
  }

  _onAutoCompleteItemClick() {
    this._doSelctAutoCompleteItem();
  }

  _onAutoCompleteItemMouseEnter(event) {
    let item = event.target;
    let index = parseInt(item.dataset.index, 10);
    this.setState({
      selectedIndex: index
    });
  }

  _closeAutoCompleteList() {
    this.setState({
      searchTracks: [],
      selectedIndex: -1
    });
  }

  _cleanSearchbar() {
    this.setState({
      keyword: ''
    });
  }

  _handleArrowKey(direction) {
    const searchTracks = this.state.searchTracks;
    if (!searchTracks.length) {
      return;
    }

    let index = this.state.selectedIndex;
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
  }

  render() {
    let keyword = this.state.keyword;
    let selectedIndex = this.state.selectedIndex;
    let searchTracks = this.state.searchTracks;
    let isSearching = this.state.isSearching;

    let loaderClass = ClassNames({
      'loader': true,
      'show': isSearching
    });

    /* jshint ignore:start */
    return (
      <div className="searchbar-component">
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
              let className = ClassNames({
                'selected': trackIndex == selectedIndex
              });
              return <li
                key={track.covers.id}
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
}

module.exports = SearchbarComponent;
