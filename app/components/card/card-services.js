(function() {
  'use strict';

  angular.module('eop.card.services', ['oep.services']).

  factory('oepTreeHouseCourses', [

    function() {
      return function() {
        return [{
          name: 'How to Make a Website',
          url: 'http://teamtreehouse.com/library/how-to-make-a-website',
          iconUrl: 'https://wac.a8b5.edgecastcdn.net/80A8B5/achievement-images/flags/cover-html-howtobuildawebsite.png',
          iconColor: '#39ADD1',
          // TODO: get lesson ids.
          lessons: [
            'Beginning HTML and CSS',
            'HTML First',
            'Creating HTML Content',
            'CSS: Cascading Style Sheets',
            'Customizing Colors and Fonts',
            'Styling Web Pages and Navigation',
            'Adding Pages to a Website',
            'Responsive Web Design and Testing',
            'Sharing a Website',
            'Debugging HTML and CSS Problems'
          ],
          progress: 0,
          completed: false,
        }];
      };
    }
  ]).

  factory('oepTrackTreehouseCourses', ['oepTreeHouseCourses',
    function(oepTreeHouseCourses) {
      return function(data) {
        // Treehouse api doesn't give information about course progress;
        // we have to track them ourselves.
        // We will start with the html beginer course.
        var result = {
          completed: {},
          inProgress: {}
        };

        if (!data.badges || !data.badges.length) {
          return result;
        }

        data.badges.reduce(function(courses, badge) {
            courses.map(function(course) {
              if (course.lessons.indexOf(badge.name) > -1) {
                course.progress += 1;
              }
            });

            return courses;
          },
          oepTreeHouseCourses()
        ).map(function(course) {
          if (course.progress >= course.lessons.length) {
            course.completed = true;
          }
          return course;
        }).forEach(function(course) {
          if (course.completed) {
            result.completed[course.name] = course;
          } else if (course.progress > 0) {
            result.inProgress[course.name] = course;
          }
        });

        return result;
      };
    }
  ]).

  factory('eopReportCardApi', ['$http', 'oepTrackTreehouseCourses', '$q', 'oepApi',
    function($http, oepTrackTreehouseCourses, $q, oepApi) {
      var api = {

        check: {
          /**
           * Check the tree house profile page exist for that user.
           *
           * Returns a promise resolving to True if the profile exist,
           * or false overwise.
           *
           */
          treeHouse: function(username) {
            var url = 'http://teamtreehouse.com/' + username + '.json';

            return $http.get(url).then(function() {
              return true;
            }).
            catch (function() {
              return false;
            });
          },

          /**
           * Check the code school profile page exist for that user and
           * if public.
           *
           * Returns a promise resolving to true if the profile exist,
           * or false overwise.
           *
           */
          codeSchool: function(username) {
            return oepApi.one('codeschool', username).get().then(function() {
              return true;
            }).
            catch (function() {
              return false;
            });
          }

        },

        consolidate: {
          treeHouse: function(data) {
            /* jshint camelcase: false*/
            return {
              id: data.profile_name,
              badges: getTreeHouseBadges(data),
              courses: oepTrackTreehouseCourses(data),
              points: data.points.total
            };
          },

          codeSchool: function(data) {
            /* jshint camelcase: false*/
            return {
              id: data.user.username,
              badges: getCodeSchoolBadges(data),
              courses: {
                completed: getCodeSchoolCourses(data.courses.completed),
                inProgress: getCodeSchoolCourses(data.courses.in_progress)
              },
              points: data.user.total_score
            };
          }
        },

        /**
         * Return treehouse user report card data
         *
         * `max` limit the number of badge details that should be return.
         * To return all the badges earned by user, set it to zero.
         */
        treeHouse: function(username) {
          var url = 'http://teamtreehouse.com/' + username + '.json';

          return $http.get(url).then(function(resp) {
            return api.consolidate.treeHouse(resp.data);
          });
        },

        /**
         * Return codeschool user report card data
         *
         * `max` limit the number of badge details that should be return.
         * To return all the badges earned by user, set it to zero.
         */
        codeSchool: function(username) {
          var profileUrl = 'https://www.codeschool.com/users/' + username,
            url = profileUrl + '.json?callback=JSON_CALLBACK';

          return $http.jsonp(url).then(function(resp) {
            return api.consolidate.codeSchool(resp.data);
          });
        },

        /**
         * Return a promise resolving to true if the stats are out of
         * date.
         *
         */
        checkStats: function(stats) {
          return $q.all([
            this._checkHouseStats(stats.treeHouse),
            this._checkCodeSchoolStats(stats.codeSchool)
          ]).then(function(result) {
            for (var i = 0; i < result.length; i++) {
              if (result[i]) {
                return true;
              }
            }
            return false;
          });
        },

        _checkHouseStats: function(details) {
          if (!details || !details.id) {
            return $q.when(false);
          }

          return this.treeHouse(details.id).then(function(info) {
            return (
              (info.badges && !details.badges) ||
              info.points !== details.points ||
              info.badges.length !== details.badges.length
            );
          });
        },

        _checkCodeSchoolStats: function(details) {
          if (!details || !details.id) {
            return $q.when(false);
          }

          return this.codeSchool(details.id).then(function(info) {
            return (
              (info.badges && !details.badges) ||
              info.points !== details.points ||
              info.badges.length !== details.badges.length
            );
          });
        }
      };

      return api;
    }
  ])

  ;

  function formatDate(date) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      d = new Date(date);

    return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function parseTreeHouseBadge(badge) {
    /* jshint camelcase: false*/
    return {
      'id': badge.id,
      'name': badge.name,
      'earnedDate': formatDate(badge.earned_date),
      'iconUrl': badge.icon_url
    };
  }

  function getTreeHouseBadges(data) {
    var badges;

    badges = _getBadges(data);
    return badges.map(parseTreeHouseBadge);
  }


  function parseSchoolBadges(badge) {
    /* jshint camelcase: false*/
    return {
      name: badge.name,
      iconUrl: badge.badge,
      url: badge.course_url
    };
  }

  function parseSchoolCourses(course) {
    return {
      name: course.title,
      iconUrl: course.badge,
      url: course.url
    };
  }

  function getCodeSchoolBadges(data) {
    return _getBadges(data).map(parseSchoolBadges);
  }

  function getCodeSchoolCourses(courses) {
    var result = {};

    courses.map(parseSchoolCourses).forEach(function(course) {
      result[course.name] = course;
    });

    return result;
  }

  function _getBadges(data) {
    if (!data.badges || !data.badges.length) {
      return [];
    } else {
      return data.badges;
    }
  }

})();