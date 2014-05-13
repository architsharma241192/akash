(function() {
  'use strict';

  function OepSuggestionFormCtrl(currentUser, suggestionApi) {
    this.api = suggestionApi;
    this.currentUser = currentUser;
    this.reset();
  }

  OepSuggestionFormCtrl.prototype.save = function(suggestion) {
    var self = this;

    this.saving = true;
    this.saved = false;

    return this.api.create(suggestion).then(function(suggestion) {
      self.suggestion = suggestion;
      self.saved = true;
    })['finally'](function() {
      self.saving = false;
    });
  };

  OepSuggestionFormCtrl.prototype.reset = function() {
    var self = this;

    this.saving = false;
    this.saved = false;
    this.suggestion = {};

    this.currentUser.auth().then(function(data) {
      if (!data || !data.info || !data.info.email) {
        return;
      }

      console.log('called');
      self.suggestion.from = data.info.email;
    });
  };

  angular.module('oep.suggestions.controllers', [
    'oep.suggestions.services',
    'oep.user.services'
  ]).

  controller('OepSuggestionFormCtrl', [
    'oepCurrentUserApi',
    'oepSuggestionsApi',
    OepSuggestionFormCtrl
  ])

  ;

})();