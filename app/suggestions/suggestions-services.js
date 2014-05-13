(function() {
  'use strict';

  angular.module('oep.suggestions.services', ['oep.services']).

  factory('oepSuggestionsApi', ['oepApi',
    function(api) {
      return {
        get: function(cursor) {
          var param = {};

          if (cursor) {
            param.cursor = cursor;
          }

          return api.all('suggestions').getList(param);
        },

        create: function(suggestion) {
          return api.all('suggestions').post(suggestion);
        }
      };
    }
  ])

  ;

})();