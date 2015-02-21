var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var usersRoute = require('./routes/users');
var questionsRoute = require('./routes/questions');

var cors = require('cors');
//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var app = express();
//app.use(cors);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(allowCrossDomain);
app.use(bodyParser.json());
var dbName = 'CerdasCermat';
var connectionString = 'mongodb://localhost:27017/'+ dbName;

mongoose.connect(connectionString, function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log('connected to mongodb');
    }
});


var User = require('./models/user');
var user = new User({
    username: 'ucup',
    password: 'wkwk'
});

var Soal = require('./models/question');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/user', usersRoute);
app.use('/api/question', questionsRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('cerdascermat');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);
var user_game = [];
var questions = [];
var room = [];
var searching = [];

Soal.find({}, function(err, soalsoal){
    if(err){
        console.log(err);
    }else{
        questions = soalsoal;
    }
});
var idid = 0;
io.sockets.on('connection', function (socket) {
    console.log("New client!");

    socket.on('answer', function(data){
        if(data.answer === questions[idid].answer){
            io.sockets.emit("soal", questions[++idid]);
            console.log('benar');
        }
        else{
            console.log('salah');
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnect');
        if(!socket.username) return;
        delete user_game[socket.username];
        user_game.splice(user_game.indexOf(socket.username), 1);
        update_user();
    });

    function update_user(){ console.log(user_game);
        io.sockets.emit('all user', Object.keys(user_game).length); console.log(user_game.length);
    }

    socket.on('register', function (data) {
        if(data.username in user_game){
            socket.emit('auth', 0); console.log('hahai');
        }
        else{ console.log('huhu');
            socket.username = data.username;
            socket.emit('auth', 1);
            console.log(socket.username+" connecteds");
            user_game[socket.username] = socket;
//            user_game.push(socket.username);
            socket.emit("soal", questions[idid]);
            update_user();
        }
    });
});

module.exports = app;