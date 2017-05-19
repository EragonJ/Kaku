import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Uuid from 'node-uuid';
import Validator from 'validator';
import ActionButton from '../shared/action-button';
import L10nSpan from '../shared/l10n-span';

class ChooseRolePage extends Component {
  constructor(props) {
    super(props);
  }

  _onSubmit(role, e) {
    e.preventDefault();
    // TODO
    // move to formsy-react later
    let errors = [];
    let $form = $(e.target);
    let userInfo = {
      role: role
    };

    if (role === 'dj') {
      userInfo.userName = $form.find('.user-name').val();
      userInfo.roomName = $form.find('.room-name').val();
      userInfo.roomKey = Uuid.v4();

      if (!userInfo.roomName) {
        errors.push(role + '-room-name');
      }
    }
    else {
      userInfo.userName = $form.find('.user-name').val();
      userInfo.roomKey = $form.find('.room-key').val();
    }

    if (!userInfo.userName.length) {
      errors.push(role + '-user-name');
    }

    if (!Validator.isUUID(userInfo.roomKey, 4)) {
      errors.push(role + '-room-key');
    }

    if (errors.length === 0) {
      this.props.onRoleChoose(userInfo);
    }
    else {
      Object.keys(this.refs).forEach((refName) => {
        let node = this.refs[refName];
        if (errors.indexOf(refName) >= 0) {
          node.classList.add('has-error');
        }
        else {
          node.classList.remove('has-error');
        }
      });
    }
  }

  render() {
    let onDJSubmit = this._onSubmit.bind(this, 'dj');
    let onGuestSubmit = this._onSubmit.bind(this, 'guest');

    return (
      <div className="choose-role-page">
        <ul className="nav nav-pills" role="tablist">
          <li className="active" role="presentation">
            <a href="#choose-dj-role-dj" aria-controls="profile" role="tab" data-toggle="tab">
              <L10nSpan l10nId="online_dj_be_a_dj"/>
            </a>
          </li>
          <li role="presentation">
            <a href="#choose-dj-role-guest" aria-controls="profile" role="tab" data-toggle="tab">
              <L10nSpan l10nId="online_dj_be_a_guest"/>
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div role="tabpanel" className="tab-pane fade in active" id="choose-dj-role-dj">
            <div className="alert alert-warning">
              <L10nSpan l10nId="online_dj_dj_intro"/>
            </div>
            <form className="form-horizontal" onSubmit={onDJSubmit}>
              <div className="form-group" ref="dj-user-name">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="online_dj_role_is_dj_your_name"/>
                </label>
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control user-name"></input>
                </div>
              </div>
              <div className="form-group" ref="dj-room-name">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="online_dj_role_is_dj_room_name"/>
                </label>
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control room-name"></input>
                </div>
              </div>
              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-3">
                  <button
                    type="submit"
                    className="btn btn-default">
                    <L10nSpan l10nId="online_dj_role_is_dj_create_room"/>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div role="tabpanel" className="tab-pane fade" id="choose-dj-role-guest">
            <div className="alert alert-warning">
              <L10nSpan l10nId="online_dj_guest_intro"/>
            </div>
            <form className="form-horizontal" onSubmit={onGuestSubmit}>
              <div className="form-group" ref="guest-user-name">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="online_dj_role_is_guest_your_name"/>
                </label>
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control user-name"></input>
                </div>
              </div>
              <div className="form-group" ref="guest-room-key">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="online_dj_role_is_guest_room_key"/>
                </label>
                <div className="col-sm-5">
                  <input
                    type="text"
                    className="form-control room-key"></input>
                </div>
              </div>
              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-3">
                  <button
                    type="submit"
                    className="btn btn-default">
                    <L10nSpan l10nId="online_dj_role_is_guest_join_room"/>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ChooseRolePage.propTypes = {
  onRoleChoose: PropTypes.func.isRequired
};

ChooseRolePage.defaultProps = {
  onRoleChoose: function() { }
};

export default ChooseRolePage;
