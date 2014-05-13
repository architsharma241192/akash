(function() {
  'use strict';

  function validator(ns, service) {
    return ['oepDebounce', 'eopReportCardApi', '$q',
      function(debounce, reportCardApi, $q) {
        return {
          require: 'ngModel',
          link: function(s, e, a, ctrl) {
            var lastQuery = $q.when(true),
              delayedChecker = debounce(function(value) {
                if (!value) {
                  ctrl.$setValidity(ns, true);
                  return;
                }
                lastQuery = lastQuery.then(function() {
                  return reportCardApi.check[service](value).then(function(exist) {
                    if (exist) {
                      ctrl.$setValidity(ns, true);
                    } else {
                      ctrl.$setValidity(ns, false);
                    }
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
    ];
  }

  angular.module(
    'eop.card.directives', [
      'eop.card.services',
      'oep.debounce.services',
      'oep.templates',
      'oep.utils.filters'
    ]
  ).

  directive('oepTreehouseReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/treehouse-card.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  directive('oepCodeSchoolReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/codeschool-card.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  directive('eopValidTreehouseUsername', validator(
    'eopValidTreehouseUsername', 'treeHouse'
  )).

  directive('eopValidCodeSchoolUsername', validator(
    'eopValidCodeSchoolUsername', 'codeSchool'
  ))

  ;

})();