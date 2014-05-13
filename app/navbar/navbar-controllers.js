(function() {
  'use strict';

  function OepNavBarCtrl(userApi) {
    this.user = userApi;
    this.user.auth();
  }

  angular.module('oep.navbar.controllers', ['oep.user.services']).

  controller('OepNavBarCtrl', ['oepCurrentUserApi', OepNavBarCtrl]);

})();