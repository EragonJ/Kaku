define(function(require) {
  'use strict';
  
  var React = require('react');

  var MenusContainer = React.createClass({
    showSearchResults: function() {

    },

    componentDidMount: function() {

    },

    render: function() {
      return (
        <div className="menus">
          <ul className="list-unstyled" role="tablist" onClick={this.showSearchResult} ref="menus">
            <li className="active" role="presentation">
              <a href="#tab-home" role="tab" data-toggle="tab">
                <i className="icon fa fa-fw fa-lg fa-home"></i>
                <span className="title">Home</span>
              </a>
            </li>
            <li role="presentation">
              <a href="#tab-search" role="tab" data-toggle="tab">
                <i className="icon fa fa-fw fa-lg fa-search"></i>
                <span className="title">Search Results</span>
              </a>
            </li>
          </ul>
        </div>
      );
    }
  });

  return MenusContainer;
});
