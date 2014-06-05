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
  factory('oepSettings', ['$window',
    function(window) {
      var _ = window._;

      function simpleId(value) {
        value = value + '';
        return {
          id: value.toLowerCase().replace(/\s+/g, '-'),
          name: value
        };
      }

      return {
        apiPath: '/api/v1',
        userOptions: {
          gender: {
            id: 'gender',
            name: 'Gender',
            choices: _.map(['Female', 'Male'], simpleId)
          },
          yearOfBirth: {
            id: 'yearOfBirth',
            name: 'Year of Birth',
            choices: _.map(['Before 1980'].concat(
              _.range(1980, new Date().getFullYear())
            ), simpleId)
          },
          schools: {
            id: 'schools',
            name: 'Schools',
            choices: [{
              id: '1',
              name: 'Singapore Management University'
            }, {
              id: '2',
              name: 'Republic Polytechnic'
            }, {
              id: '3',
              name: 'Temasek Polytechnic'
            }, {
              id: '4',
              name: 'K12'
            }, {
              id: '5',
              name: 'Dunman High School'
            }, {
              id: '6',
              name: 'Pioneer Junior College'
            }, {
              id:'7',
              name: 'NUS High School'
            }, {
              id: '8',
              name: 'Nanyang Polytechnic'
            }, {
              id: '9',
              name: 'Singapore Polytechnic'
            }, {
              id: '10',
              name: 'Ngee Ann Polytechnic'
            }, {
              id: '11',
              name: 'National University of Singapore'
            }, {
              id: '12',
              name: 'Nanyang Technological University'
            }, {
              id: '0',
              name: 'Other'
            }]
          },
          services: {
            id: 'services',
            name: 'services',
            choices: [{
              id: 'treeHouse',
              name: 'Treehouse'
            }, {
              id: 'codeSchool',
              name: 'Code School'
            }, {
              id: 'codeCombat',
              name: 'Code Combat'
            }]
          }
        }
      };
    }
  ])

  ;

})();