import React from 'react';
import L10nSpan from '../shared/l10n-span';
import ChooseRolePage from './choose-role-page';
import DashboardPage from './dashboard-page';
import Firebase from '../../../modules/wrapper/Firebase';

const MAX_PAGE_COUNT = 2;

let OnlineDJComponent = React.createClass({
  getInitialState: function() {
    return {
      page: 0,
      userInfo: {}
    };
  },

  componentDidMount: function() {

  },

  _onRoleChoose: function(userInfo) {
    this.setState({
      userInfo: userInfo
    });

    // TODO
    // we need to change userInfo to make it cleaner later.
    //
    // {
    //   role: 'xxx',
    //   userName: 'xxx',
    //   roomName: 'yyy',
    //   roomKey: 'zzz'
    // }
    Firebase.setup(userInfo.roomKey, userInfo);

    let ref = Firebase.joinMetadataRoom();
    if (userInfo.role === 'dj') {
      let metadata = {
        roomName: userInfo.roomName,
        roomKey: userInfo.roomKey
      };
      Firebase.setMetadata(metadata);
      ref.set(metadata);
    }
    else {
      ref.on('value', (snapshot) => {
        Firebase.setMetadata(snapshot.val());
      });
    }
    this._changeToPage(1);
  },

  _onLeft: function() {
    Firebase.leaveAll();
    this._changeToPage(0);
  },

  _changeToPage: function(page) {
    page = Math.max(0, Math.min(page, MAX_PAGE_COUNT - 1));

    this.setState({
      page: page
    });
  },

  render: function() {
    /* jshint ignore:start */
    let page = this.state.page;
    let userInfo = this.state.userInfo;
    let renderedElement;

    return (
      <div className="online-dj-slot" data-page={page}>
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-headphones"></i>
            <L10nSpan l10nId="online_dj_header"/>
          </h1>
        </div>
        <div>
          <ChooseRolePage onRoleChoose={this._onRoleChoose}/>
          <DashboardPage userInfo={userInfo} onLeft={this._onLeft}/>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = OnlineDJComponent;
