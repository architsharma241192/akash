(function() {
  'use strict';

  angular.module('oep.user.directives', ['oep.user.services', 'oep.debounce.services']).

  directive('oepUniqId', ['oepDebounce', 'oepUsersApi', '$q',

    function(debounce, userApi, $q) {

      return {
        require: 'ngModel',
        link: function(s, e, a, ctrl) {
          var lastQuery = $q.when(true),
            delayedChecker = debounce(function(value) {
              if (!value) {
                ctrl.$setValidity('oepUniqId', true);
                return;
              }

              lastQuery = lastQuery.then(function(){
                return userApi.getById(value).then(function() {
                  ctrl.$setValidity('oepUniqId', false);
                  return true;
                }).catch(function(){
                  ctrl.$setValidity('oepUniqId', true);
                  return true;
                });
              });
            }, 1000),
            checker = function(value) {
              delayedChecker(value);
              return value;
            };

          ctrl.$parsers.push(checker);
          ctrl.$formatters.push(checker);
        }
      };
    }
  ])


  ;

})();