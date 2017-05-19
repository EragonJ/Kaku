import React, { Component } from 'react';
import L10nSpan from '../shared/l10n-span';
import NewsTag from '../news/news-tag';
import NewsFetcher from '../../../modules/NewsFetcher';

class NewsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      news: []
    };
  }

  componentDidMount() {
    NewsFetcher.get().then((news) => {
      this.setState({
        news: news
      });
    });
  }

  render() {
    let news = this.state.news;

    return (
      <div className="news-slot">
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-rss"></i>
            <L10nSpan l10nId="news_header"/>
          </h1>
        </div>
        <div className="news-component">
          {news.map((eachNews, index) => {
            return <NewsTag key={index} data={eachNews}/>
          })}
        </div>
      </div>
    );
  }
}

module.exports = NewsComponent;
