/**
 * oep.config - Config for oep app.
 *
 */
(function() {
  'use strict';

  angular.module('oep.config', []).

  /**
   * oepSettings - Default setting for oep app.
   *
   */
  value('oepSettings', {
    apiPath: '/api/v1'
  })

  ;

})();
