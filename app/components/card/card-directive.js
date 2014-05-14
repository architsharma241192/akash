/**
 * eop.card.directives - directives for the report card components
 *
 * Defines:
 *
 * - `oepTreehouseReportCard`
 * - `oepCodeSchoolReportCard`
 * - `eopValidTreehouseUsername`
 * - `eopValidCodeSchoolUsername`
 *
 */
(function() {
  'use strict';

  /**
   * Third party username validator factory.
   *
   * Uses eopReportCardApi service to check that a user name exists.
   *
   * Note that the validator is "debounced". I will only run after one
   * second has passed since the last change to the ngModel value.
   *
   */
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

  /**
   * oepTreehouseReportCard - Directive displaying a user Treehouse badges.
   *
   */
  directive('oepTreehouseReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/card-treehouse.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  /**
   * oepCodeSchoolReportCard - Directive displaying a user Code School badges.
   *
   */
  directive('oepCodeSchoolReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/card-codeschool.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  /**
   * eopValidTreehouseUsername - Validator a text input (associated to a ngModel).
   *
   * Check that the the ngModel value correspond to a valid Treehouse username.
   *
   * Populate the ngModel `$error` collection with a `eopValidTreehouseUsername`
   * property set to `true` when the username doesn't exist.
   *
   */
  directive('eopValidTreehouseUsername', validator(
    'eopValidTreehouseUsername', 'treeHouse'
  )).

  /**
   * eopValidCodeSchoolUsername - Validator a text input (associated to a ngModel).
   *
   * Check that the the ngModel value correspond to a valid Code School username.
   *
   * Populate the ngModel `$error` collection with a `eopValidCodeSchoolUsername`
   * property set to `true` when the username doesn't exist.
   *
   */
  directive('eopValidCodeSchoolUsername', validator(
    'eopValidCodeSchoolUsername', 'codeSchool'
  ))

  ;

})();