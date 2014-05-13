(function() {
  'use strict';
  var api;

  function origin(location) {
    if (location.origin) {
      return location.origin;
    }

    return location.protocol +
      '//' + location.hostname +
      (location.port ? ':' + location.port: '');

  }

  function refUrl(userId, location) {
    return origin(location) + '/?ref=' + userId;
  }

  angular.module('oep.user.services', ['oep.services', 'oep.debounce.services']).

  factory('oepUsersApi', ['oepApi', 'oepDebounce', '$window',
    function(oepApi, debounce, window) {
      var updatePromises = {};

      return {
        getById: function(id) {
          return oepApi.one('users', id).get().then(function(info) {
            info.refUrl = refUrl(info.id, window.location);
            return info;
          });
        },

        getRanks: function(sortBy) {
          var param = {};
          if (sortBy) {
            param.sortBy = sortBy;
          }
          return oepApi.all('ranks').getList(param);
        },

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

        save: function(data) {
          return oepApi.one('user').customPUT(data);
        },

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

  config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('oepCurrentHttpInterceptor');
    }
  ])

  ;


})();