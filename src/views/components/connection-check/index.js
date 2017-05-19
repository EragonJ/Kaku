import React, { Component } from 'react';
import ClassNames from 'classnames';
import L10nSpan from '../shared/l10n-span';

class ConnectionCheckComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOnline: navigator.onLine
    };

    this._checkConnection = this._checkConnection.bind(this);
  }

  componentDidMount() {
    window.addEventListener('online', this._checkConnection);
    window.addEventListener('offline', this._checkConnection);
  }

  _checkConnection() {
    this.setState({
      isOnline: navigator.onLine
    });
  }

  render() {
    const className = ClassNames({
      'connection-check-component': true,
      'global-overlay': true,
      'is-online': this.state.isOnline
    });

    return (
      <div className={className}>
        <h1>
          <i className="fa fa-exclamation-triangle"></i>
          <L10nSpan l10nId="component_connection_lost"/>
        </h1>
      </div>
    );
  }
}

module.exports = ConnectionCheckComponent;
