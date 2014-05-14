/**
 * oep.user.services - Services for the user components.
 *
 * Defines:
 *
 * - oepUsersApi
 * - oepCurrentUserApi
 *
 * It also defines and install a http interceptor to to reset info about
 * the current user when angular http backend receives a 401 error code
 * the OEP API server.
 *
 */
(function() {
  'use strict';
  var api;

  /**
   * Returns the origin attribute of location or the equivalent
   * if location doesn't defines it.
   *
   */
  function origin(location) {
    if (location.origin) {
      return location.origin;
    }

    return location.protocol +
      '//' + location.hostname +
      (location.port ? ':' + location.port: '');

  }

  /**
   * Returns a referral url.
   *
   * TODO: defines in that modules how to extract the referrer from a URL.
   *
   */
  function refUrl(userId, location) {
    return origin(location) + '/?ref=' + userId;
  }

  angular.module('oep.user.services', ['oep.services', 'oep.debounce.services']).

  /**
   * oepUsersApi - Client fro OEP user api.
   *
   */
  factory('oepUsersApi', ['oepApi', 'oepDebounce', '$window',
    function(oepApi, debounce, window) {
      var updatePromises = {};

      return {
        /**
         * Fetch the info for the user (defined by it his/her id)
         */
        getById: function(id) {
          return oepApi.one('users', id).get().then(function(info) {
            info.refUrl = refUrl(info.id, window.location);
            return info;
          });
        },

        /**
         * Get top 25 user ranks
         *
         */
        getRanks: function(sortBy) {
          var param = {};

          if (sortBy) {
            param.sortBy = sortBy;
          }

          return oepApi.all('ranks').getList(param);
        },

        /**
         * Request the users badges info to be updated.
         *
         * TODO: rename it to updateBagdes.
         *
         */
        updateStats: function(id) {
          if (!updatePromises[id]) {
            updatePromises[id] = debounce(function(id) {
              return oepApi.one('users', id).one('stats').post();
            }, 2000);
          }

          return updatePromises[id](id);
        }
      };
    }
  ]).

  /**
   * oepCurrentUserApi - api to access the current user data.
   *
   * oepCurrentUserApi.get(returnUrl)  Return the user name, id and the
   * the logout url if the user logged in. Return the login url if the
   * user logged off.
   *
   * Note that it returns a promise that resole in either case. If the promise
   * fails, there was either a problem with the optional return url, or
   * there's an unexpected issue with the backend.
   *
   */
  factory('oepCurrentUserApi', ['$location', '$q', 'oepApi', '$window',
    function($location, $q, oepApi, window) {
      api = {
        data: null,
        loading: null,

        _get: function(returnUrl) {
          var params = {
            returnUrl: (
              returnUrl ||
              $location.absUrl()
            )
          };

          return oepApi.one('user').get(params).then(function(data) {
            return data;
          });
        },

        /**
         * Authenticate the user.
         *
         * Returns a promise resolving to the login status of the current
         * user with its info (if he registered).
         *
         */
        auth: function(returnUrl) {

          if (api.data) {
            return $q.when(api.data);
          }

          if (api.loading) {
            return api.loading;
          }


          api.loading = api._get(returnUrl).then(function(user) {
            if (user && user.info && user.info.id) {
              user.info.refUrl = refUrl(user.info.id, window.location);
            }

            api.data = user;
            return user;
          })['finally'](function() {
            api.loading = null;
          });

          return api.loading;
        },

        /**
         * Update the current user data.
         *
         */
        save: function(data) {
          return oepApi.one('user').customPUT(data);
        },

        /**
         * Reset the cached user info data.
         *
         * Should be used when we know the info are outdated or when
         * the user is logged off.
         *
         */
        reset: function(loginUrl, msg) {
          var currentLoginUrl = api.data && api.data.loginUrl || null;

          loginUrl = loginUrl || currentLoginUrl;
          if (loginUrl) {
            api.data = {
              loginUrl: loginUrl,
              error: msg
            };
          } else {
            api.data = null;
          }
        }
      };

      return api;
    }
  ]).

  /**
   * Intercept http response error to reset oepCurrentUserApi on http
   * 401 response.
   *
   */
  factory('oepCurrentHttpInterceptor', ['$q', '$location',
    function($q, $location) {
      var httpPattern = /https?:\/\//,
        thisDomainPattern = new RegExp(
          'https?://' + $location.host().replace('.', '\\.')
        );

      function isSameDomain(url) {
        return !httpPattern.test(url) || thisDomainPattern.test(url);
      }

      return {
        responseError: function(resp) {
          if (
            resp.status === 401 &&
            isSameDomain(resp.config.url)
          ) {
            api.reset(resp.data.loginUrl, resp.data.error);
          }

          return $q.reject(resp);
        }
      };
    }
  ]).

  /**
   * Configure angular http backend to add oepCurrentHttpInterceptor
   * as interceptor.
   */
  config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('oepCurrentHttpInterceptor');
    }
  ])

  ;


})();