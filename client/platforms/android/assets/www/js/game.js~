/**
 * Created by ucup_aw on 19/02/15.
 */
var base_url = "http://localhost:3000/";
var current_id = "";
app.controller('control', ['$scope', '$http', 'socket', function ($scope, $http, socket) {

//function control($scope, $http, socket) {
    $scope.register = false;
    $scope.login = true;
    $scope.question_show = false;
    $scope.username_register = '';
    $scope.label_username = '';
    $scope.password2_register = '';
    $scope.password1_register = '';
    $scope.password_login = '';
    $scope.username_login = '';
    $scope.pertanyaan = '';
    $scope.jawaban = '';
    $scope.username = '';

    $scope.loginUser = function () {
        $scope.login = true;
    };

    $scope.toRegister = function () {
        $scope.login = false;
        $scope.register = true;
    };

    $scope.toLogin = function () {
        $scope.login = true;
        $scope.register = false;
    };

    $scope.$watch('username_register', function () {
        $scope.cekUsername();
    });

    $scope.$watch('password2_register', function () {
        $scope.cekPasswordSecond();
    });


    $scope.cekUsername = function () {
        if ($scope.username_register.length < 4) {
            console.log('kurang dari 4');
            $scope.label_username = 'kurang dari 4';
        }
        else {
            $http.get(base_url + "api/user/cekusername/" + $scope.username_register).success(function (response) {
                if (response == 0) {
                    console.log('username tersedia');
                    $scope.label_username = 'username tersedia';
                }
                else {
                    console.log('username sudah digunakan');
                    $scope.label_username = 'username sudah digunakan';
                }
            });
        }
    };

    $scope.cekPasswordFirst = function () {

    };

    $scope.cekPasswordSecond = function () {
        if ($scope.password2_register != $scope.password1_register) {
            console.log('password tidak sama');
        }
        else {
            console.log('password sama');
        }
    };

    $scope.prosesRegister = function () {
        var data = {'username': $scope.username_register, 'password': $scope.password1_register};
        $http.post(base_url + "api/user/register/", data).success(function (response) {
            if (response == '1') {
                socket.emit('successlogin', {  username: $scope.username_register});
                $scope.question_show = true;
                $scope.login = false;
                $scope.register = false;
                $scope.username = $scope.username_register;
            }
        });
    };

    $scope.prosesLogin = function () {
        var data = {'username': $scope.username_login, 'password': $scope.password_login};
        $http.post(base_url + 'api/user/login', data).success(function (response) {
            if (response == 1) {
                socket.emit('successlogin', {  username: $scope.username_login});
                $scope.question_show = true;
                $scope.login = false;
                $scope.register = false;
                $scope.username = $scope.username_login;
            }
        }).error(function (err) {
            alert(err);
        });
    };

    $scope.prosesJawab = function () {
        var data = {id: current_id, answer: $scope.jawaban};
        socket.emit('answer', data);
    };

    socket.on('soal', function (data) {
        console.log(data.question);
        current_id = data._id;
        $scope.pertanyaan = data.question;
        $scope.jawaban = '';
        $('#users_answer').html('');
    });

    socket.on('all user', function(data){
        $scope.user_online = data;
    });

    socket.on('users answer', function(data){
       console.log(data);
        $('#users_answer').append(data.username+"<br />");
    });
}]);

app.directive('list_jawaban', function(){
   return {
       restrict : "E",
       template : ""
   }
});

app.directive('show_answers', function($compile){
    return function(scope, element, attrs){
        element.bind("click", function(){
            scope.count++;
            angular.element(document.getElementById('space_for_answers')).append($compile("<div><button class='btn btn-default' data-alert="+scope.count+">Show alert #"+scope.count+"</button></div>")(scope));
        });
    };
});

myApp.directive("alert", function(){
    return function(scope, element, attrs){
        element.bind("click", function(){
            console.log(attrs);
            alert("This is alert #"+attrs.alert);
        });
    };
});