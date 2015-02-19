/**
 * Created by ucup_aw on 08/02/15.
 */

var base_url = "http://localhost:3000/";
var current_id = '';
angular.module('ngAppStrictDemo', []).controller( 'control', function($scope,$http) {
    $scope.input_question = '';
    $scope.input_answer = '';
    $scope.questions = [];
    $http.get(base_url + "api/questions").success(function(response) {
        console.log(response);
        for(var i = 0; i < response.length; i++){
            $scope.questions[i] = {
                id : i, _id: response[i]._id, question: response[i].question, answer: response[i].answer
            };
//            $scope.questions.push(row);
        }
    });

    $scope.edit = true;
    $scope.error = false;
    $scope.incomplete = false;
    $scope.editQuestion = function(id){
        if(id == 'new'){
            $scope.edit = true;
            $scope.incomplete = true;
            $scope.input_question = '';
            $scope.input_answer = '';
        } else{
            $scope.edit = true;
            $scope.input_question = $scope.questions[id].question;
            $scope.input_answer = $scope.questions[id].answer;
        }
        current_id = id;
    };

    $scope.saveQuestion = function(){
        var data = {'question': $scope.input_question, 'answer': $scope.input_answer}
        if(current_id == 'new'){
            $http.post(base_url + "api/questions", data).success(function(response) {
                $scope.questions = [];
            });
        }
        else{
            $http.put(base_url+"api/questions/"+$scope.questions[current_id]._id, data).success(function(response){
                $scope.questions = [];console.log(response);
            });
        }

        $http.get(base_url + "api/questions").success(function(response) {
            for(var i = 0; i < response.length; i++){
                $scope.questions[i] = {
                    id : i, question: response[i].question, answer: response[i].answer
                };
            }
        });
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
});





//$(document).ready(function() {

//    $.ajax({
//        url : base_url + "api/questions",
//        type : "GET",
//        data : $.param({
//            init : 'ok'
//        }),
//        beforeSend : function() {
//
//        },
//        complete : function() {
//
//        },
//        success : function(reply) {
//            //var msg = JSON.parse(reply);
//            console.log(reply);
//            var content = "<table>";
//            for(var i = 0; i < reply.length; i++){
//                content += "<tr><td>"+reply[i].question+"</td><td>"+reply[i].answer+"</td></tr>";
//            }
//            content += "</table>";
//            $('#questions').html(content);
//        },
//        error : function() {
//        }
//    });
//});
