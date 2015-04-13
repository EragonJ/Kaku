define(function(require) {
  'use strict';
  
  var CoreData = require('backend/CoreData');
  var React = require('react');
  var $ = require('jquery');

  var MenusContainer = React.createClass({
    componentDidMount: function() {
      this._bindTabChangeEvent();
      this._watchTabChangeEvent();
    },

    _bindTabChangeEvent: function() {
      var menusDOM = this.refs.menus.getDOMNode();
      var links = menusDOM.querySelectorAll('a[data-toggle="tab"]');
      // NOTE
      // not sure whether this would conflict with pre-bound
      // bootstrap events
      $(links).on('shown.bs.tab', function() {
        var href = $(this).attr('href');
        var tabName = href.replace('#tab-', '');
        CoreData.set('currentTab', tabName);
      });
    },

    _watchTabChangeEvent: function() {
      var self = this;
      CoreData.watch('currentTab', function(_1, _2, newTabName) {
        var linkToTabRef = self.refs['tab-' + newTabName];
        $(linkToTabRef.getDOMNode()).tab('show');
      });
    },

    render: function() {
      return (
        <div className="menus">
          <ul className="list-unstyled" role="tablist" ref="menus">
            <li className="active" role="presentation">
              <a href="#tab-home" role="tab" data-toggle="tab" ref="tab-home">
                <i className="icon fa fa-fw fa-lg fa-home"></i>
                <span className="title">Home</span>
              </a>
            </li>
            <li role="presentation">
              <a href="#tab-search" role="tab" data-toggle="tab" ref="tab-search">
                <i className="icon fa fa-fw fa-lg fa-search"></i>
                <span className="title">Search Results</span>
              </a>
            </li>
            <li role="presentation">
              <a href="#tab-history" role="tab" data-toggle="tab" ref="tab-history">
                <i className="icon fa fa-fw fa-lg fa-history"></i>
                <span className="title">Histories</span>
              </a>
            </li>
          </ul>
        </div>
      );
    }
  });

  return MenusContainer;
});
