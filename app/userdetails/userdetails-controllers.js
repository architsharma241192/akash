(function() {
  'use strict';

  var googleNickNamePattern = /([^@]+)(@.+)?/,
    userIdFilterPattern = /[^-\w\d.]/g;


  function defaultId(name) {
    var n = defaultName(name);
    return n.replace(userIdFilterPattern, '');
  }

  function defaultName(name) {
    return googleNickNamePattern.exec(name)[1];
  }

  function OepUserCtrl(user, userApi, reportCardApi) {
    this.data = user;

    if (!user || !user.services) {
      return;
    }

    reportCardApi.checkStats(user.services).then(function(shouldUpdate){

      if (!shouldUpdate) {
        return;
      }

      userApi.updateStats(user.id).then(function(stats) {
        user.services = stats;
      });
    });
  }


  function OepUserFormListCtrl($location, $window, userApi, user) {
    var $ = $window.jQuery,
      search = $window.location.search,
      refPattern = /\?([^&]+&)*ref=([^&]+)(&.*)?/,
      match = refPattern.exec(search);

    this.$ = $;
    this.location = $location;
    this.userApi = userApi;
    this.saving = false;
    this.userIdPatter = /^[-\w\d.]+$/;
    this.isNewUser = !user.info;
    this.user = $.extend({}, user);
    this.ref = match && match.length > 2 ? match[2] : null;

    if (!this.user.info) {
      this.newUserInfo();
    }


    if (!this.user.info.id) {
      this.user.info.id = defaultId(user.name);
      this.user.info.name = defaultName(user.name);
    }
  }

  OepUserFormListCtrl.prototype = {
    newUserInfo: function() {
      this.user.info = {};
      if (this.ref) {
        this.user.info.referredBy = this.ref;
      }
    },

    save: function(userInfo) {
      var self = this;

      this.saving = true;
      this.userApi.save(userInfo).then(function() {
        self.userApi.reset();
        self.location.path('/');
        self.saving = false;
      });
    },

    addParent: function(parent) {
      if (!this.user.info.parents) {
        this.user.info.parents = [];
      }

      this.user.info.parents.push(this.$.extend({}, parent));
      parent.name = parent.email = null;
    }
  };

  angular.module('oep.userdetails.controllers', ['oep.user.services', 'eop.card.directives', 'eop.card.services']).

  controller('OepUserCtrl', ['user', 'oepUsersApi', 'eopReportCardApi', OepUserCtrl]).
  controller('OepUserFormListCtrl', ['$location', '$window', 'oepCurrentUserApi', 'user', OepUserFormListCtrl])

  ;

})();