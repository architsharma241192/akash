(function() {
  'use strict';

  function OepRanksShowRanks(userApi, currentUserApi) {
    this.currentUser = currentUserApi;
    this.userApi = userApi;

    this.ranks = null;
    this.userStats = null;
    this.sortedBy = null;

    currentUserApi.auth().then(this.setUserStats.bind(this));
    this.getRanks('score');
  }

  OepRanksShowRanks.prototype = {
    setUserStats: function() {
      if (this.ranks === null) {
        return;
      }

      if (!this.currentUser.data || !this.currentUser.data.stats) {
        return;
      }

      for (var i = 0; i < this.ranks.length; i++) {
        if (this.ranks[i].id === this.currentUser.data.stats.id) {
          return;
        }
      }

      this.userStats = this.currentUser.data.stats;
    },

    getRanks: function(sortBy) {
      var self = this;

      this.ranks = null;
      this.sortedBy = sortBy;
      return this.userApi.getRanks(sortBy).then(function(ranks) {
        self.ranks = ranks;
        self.setUserStats();
        return ranks;
      });
    }
  };


  angular.module('oep.ranks.controllers', ['oep.user.services', 'eop.card.directives']).

  controller('OepRanksShowRanks', ['oepUsersApi', 'oepCurrentUserApi', OepRanksShowRanks])

  ;

})();