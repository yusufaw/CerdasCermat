/**
 * Created by ucup_aw on 22/02/15.
 */

/* Filters */
angular.module('myApp.filters', []).
    filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }]);