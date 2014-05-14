/**
 * oep.ranks.controllers - Controller for the ranks subsection
 *
 * Defines `OepRanksShowRanks`.
 */
(function() {
  'use strict';

  /**
   * OepRanksShowRanks - Controller for the ranks subsction
   *
   * Fetch the users ranks to populate the scope (added the ranks
   * property.
   *
   * Scope will also include `sortBy` order and the current user stats
   * (as `userStats`) If the current user is not part of top ranks.
   *
   */
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
    /**
     * Populate the scope `userStats` property with the current user stats
     * if he's not part of the top rank.
     */
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

    /**
     * Fetch rank and populate the scope `ranks` property with it.
     *
     */
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