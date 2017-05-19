import React, { Component } from 'react';
import L10nSpan from '../l10n-span';

class NoTrack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="notracks">
        <L10nSpan l10nId="component_no_track"/>
      </div>
    );
  }
}

module.exports = NoTrack;
