(function() {
  'use strict';

  angular.module('oep.debounce.services', []).


  factory('oepDebounce', ['$timeout', '$q',
    function($timeout, $q) {
      return function(fn, delay, invokeApply) {
        var timeoutPromise,
          nextResult;

        return function() {
          var self = this,
            args = arguments;

          if (timeoutPromise) {
            $timeout.cancel(timeoutPromise);
          }

          if(!nextResult) {
            nextResult = $q.defer();
          }

          timeoutPromise = $timeout(function() {
            var r = nextResult;

            timeoutPromise = null;
            nextResult = null;
            r.resolve(fn.apply(self, args));
          }, delay, invokeApply);

          return nextResult.promise;
        };

      };
    }
  ])


  ;

})();