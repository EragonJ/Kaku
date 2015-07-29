define(function(require) {
  'use strict';

  var React = require('react');
  var L10nSpan = require('components/shared/l10n-span');
  var NewsTag = require('components/news/news-tag');
  var NewsFetcher = require('backend/modules/NewsFetcher');

  var NewsContainer = React.createClass({
    getInitialState: function() {
      return {
        news: []
      };
    },

    componentDidMount: function() {
      NewsFetcher.get().then((news) => {
        this.setState({
          news: news
        });
      });
    },

    render: function() {
      var news = this.state.news;

      /* jshint ignore:start */
      return (
        <div className="news-slot">
          <div className="header clearfix">
            <h1>
              <i className="fa fa-fw fa-rss"></i>
              <L10nSpan l10nId="news_header"/>
            </h1>
          </div>
          <div className="news-container">
            {news.map(function(eachNews) {
              return <NewsTag data={eachNews}/>
            })}
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return NewsContainer;
});
