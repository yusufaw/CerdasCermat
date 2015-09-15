/**
 * Created by ucup_aw on 08/02/15.
 */

var base_url = "http://localhost:3000/";
var current_id = 'new';
angular.module('ngAppStrictDemo', []).controller( 'control', function($scope,$http) {
    $scope.input_question = '';
    $scope.input_answer = '';
    $scope.questions = [];

    getAllQuestion();
    function getAllQuestion(){
        $http.get(base_url + "api/question").success(function(response) {
            //console.log(response);
            var x = 0;
            for(var i = (response.length-1); i >= 0; i--){
                $scope.questions[response.length-i-1] = {
                    id : x, _id: response[i]._id, question: response[i].question, A: response[i].A, B: response[i].B, C: response[i].C, D: response[i].D, benar: response[i].benar
                };
                x++;
            }
        });
    }

    $scope.edit = false;
    $scope.error = false;
    $scope.incomplete = false;
    $scope.editQuestion = function(id){
        if(id == 'new'){
            $scope.edit = true;
            $scope.incomplete = true;
            $scope.input_question = '';
            $scope.input_answer = '';
        } else{
            $scope.edit = false;
            $scope.input_question = $scope.questions[id].question;
            $scope.input_answer = $scope.questions[id].answer;
        }
        current_id = id;
    };

    $scope.saveQuestion = function(){
        var data = {'question': $scope.input_question, 'answer': $scope.input_answer}
        if(current_id == 'new'){
            $http.post(base_url + "api/question", data).success(function(response) {
                $scope.questions = [];
            });
        }
        else{
            $http.put(base_url+"api/question/"+$scope.questions[current_id]._id, data).success(function(response){
                $scope.questions = [];console.log(response);
            });
        }

        getAllQuestion();
    }

    $scope.$watch('input_question', function() {$scope.test();});
    $scope.$watch('input_answer', function() {$scope.test();});

    $scope.test = function() {
        $scope.incomplete = false;
        if ($scope.edit && (!$scope.input_question.length ||
            !$scope.input_answer.length)) {
            $scope.incomplete = true;
        }
    };
})
    .controller( 'userCtrl', function($scope,$http) {
        $scope.input_username = '';
        $scope.input_password = '';
        $scope.input_email = '';
        $scope.users = [];
        $http.get(base_url + "api/user").success(function(response) {
            console.log(response);
            for(var i = 0; i < response.length; i++){
                $scope.users[i] = {
                    id : i, _id: response[i]._id, username: response[i].username, email: response[i].email, answer: response[i].answer
                };
            }
        });

        $scope.edit = true;
        $scope.error = false;
        $scope.incomplete = false;
        $scope.editUser = function(id){
            if(id == 'new'){
                $scope.edit = true;
                $scope.incomplete = true;
                $scope.input_username = '';
                $scope.input_password = '';
                $scope.input_email = '';
            } else{
                $scope.edit = true;
                $scope.input_username = $scope.users[id].username;
                $scope.input_password = $scope.users[id].password;
                $scope.input_email = $scope.users[id].email;
            }
            current_id = id;
        };

        $scope.saveUser = function(){
            var data = {
                'username': $scope.input_username,
                'password': $scope.input_password,
                'email': $scope.input_email
            }
            if(current_id == 'new'){
                $http.post(base_url + "api/user", data).success(function(response) {
                    console.log(response);
                    $scope.users = [];
                });
            }
            else{
                $http.put(base_url+"api/user/"+$scope.users[current_id]._id, data).success(function(response){
                    $scope.users = [];console.log(response);
                });
            }

            $http.get(base_url + "api/user").success(function(response) {
                for(var i = 0; i < response.length; i++){
                    $scope.users[i] = {
                        id : i,
                        username: response[i].username,
                        password: response[i].password,
                        email: response[i].email
                    };
                }
            });
        };

        $scope.removeUser = function (id) {
            $http.delete(base_url+'api/user/'+id)
                .success(function (response) {
                    console.log(response);
                    $http.get(base_url + "api/user").success(function(response) {
                        for(var i = 0; i < response.length; i++){
                            $scope.users[i] = {
                                id : i,
                                username: response[i].username,
                                password: response[i].password,
                                email: response[i].email
                            };
                        }
                    });
                })
        }

        $scope.$watch('input_username', function() {$scope.test();});
        $scope.$watch('input_password', function() {$scope.test();});
        $scope.$watch('input_email', function() {$scope.test();});

        $scope.test = function() {
            $scope.incomplete = false;
            if ($scope.edit && (!$scope.input_username.length ||
                !$scope.input_password.length || !$scope.input_email.length)) {
                $scope.incomplete = true;
            }
        };
    });