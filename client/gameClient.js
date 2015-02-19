/**
 * Created by ucup_aw on 10/01/15.
 */

var socket = io.connect('http://localhost:3000');
var current_id = "";
socket.on('all user', function(data){
   $('#jml_ol').html(data);console.log("jml : "+data);
});
socket.on('soal', function(data){
    console.log(data);
    current_id = data._id;
    $('#pertanyaan').html(data.question);
});

socket.on('auth', function(data){
    console.log(data);
   if(data==1){
       $('#form_register').hide();
       $('#panel_soal').show();
   }
});
$('#button_register').click( function(e){
    //console.log(JSON.str  ingify($('#form_register').serialize()));
    socket.emit('register', {  username:$('#usrname').val()});
});

$('#button_jawan').click( function(e){
    var data = {id:  current_id, answer: $('#jawaban').val()}
    socket.emit('answer', data);
});