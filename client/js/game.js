/**
 * Created by ucup_aw on 19/02/15.
 */
var base_url = "http://localhost:3000/";
angular.module('AppGame', []).controller('control', function ($scope, $http) {
    $scope.register = false;
    $scope.login = true;
    $scope.username_register = '';

    $scope.loginUser = function () {
        $scope.login = true;
    }

    $scope.toRegister = function () {
        $scope.login = false;
        $scope.register = true;
    }

    $scope.toLogin = function () {
        $scope.login = true;
        $scope.register = false;
    }

    $scope.$watch('username_register', function () {
        $scope.cekUsername();
    });

    $scope.cekUsername = function () {
        if ($scope.username_register.length < 4) {
            console.log('kurang dari 4');
        }
        else {
            $http.get(base_url + "api/user/cekusername/" + $scope.username_register).success(function (response) {
                if(response == 0){
                    console.log('username tersedia');
                }
                else{
                    console.log('username sudah digunakan');
                }
            });
        }
    }

    $scope.prosesRegister = function(){

    }
});