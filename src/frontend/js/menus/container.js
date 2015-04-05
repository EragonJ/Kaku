define(function(require) {
  'use strict';
  
  var React = require('react');
  var $ = require('jquery');

  var MenusContainer = React.createClass({
    showSearchResults: function() {

    },

    componentDidMount: function() {
      // var menusDOM = this.refs.menus.getDOMNode();
      // $(menusDOM).find('a').click(function(e) {
      //   e.preventDefault();
      //   $(this).tab('show');
      // });
    },

    render: function() {
      return (
        <div className="menus">
          <ul className="list-unstyled" role="tablist" onClick={this.showSearchResult} ref="menus">
            <li className="active" role="presentation">
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
