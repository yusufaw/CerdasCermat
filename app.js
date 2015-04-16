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
var allowCrossDomain = function (req, res, next) {
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
var connectionString = 'mongodb://localhost:27017/' + dbName;

mongoose.connect(connectionString, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('connected to mongodb');
    }
});

var User = require('./models/user');
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
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var debug = require('debug')('cerdascermat');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);
var user_game = [];
var questions = [];
var room = [];
var searchingX = [];
var searchingY = [];

io.sockets.on('connection', function (socket) {
    console.log("New client conected");
    var current_soal = [];
    var ready = 0;

    socket.on('logout', function () {
        if (!socket.username) return;
        delete user_game[socket.username];
        user_game.splice(user_game.indexOf(socket.username), 1);
    });

    socket.on('ready', function () {
        io.to(socket.name_room).emit("ready other", 'ok');
    });

    socket.on('answer', function (data) {
        if(socket.tipe == 'Y'){console.log('aku Y');

            if(data.answer == current_soal.answer){
                var dt = {
                    'isbenar': '1',
                    'username': data.username,
                    'answer': data.answer
                }
                io.to(socket.name_room).emit('result answered', dt);
                console.log(data.username+' menjawab '+data.answer);
                current_soal = questions[socket.name_room].shift();
                io.to(socket.name_room).emit("soal", current_soal.question);
            }
            else{
                var dt = {
                    'isbenar': '1',
                    'username': data.username,
                    'answer': data.answer
                }
                io.to(socket.name_room).emit('result answered', dt);
            }
        }
        else{console.log('mengirim ke '+socket.musuh.username);
            socket.musuh.emit('other answer', data);console.log('aku X');
        }
    });

    socket.on('all ready', function () {
        if (socket.tipe == 'Y') {
            var data = {
                'user' : socket.username,
                'tipe': 'Y',
                'soal': {
                    'id':current_soal.id,
                    'pertanyaan': current_soal.question
                }
            }
            io.to(socket.name_room).emit("soal", data);
        }
    });

    socket.on('typing', function(data){
        io.to(socket.name_room).emit("typing", data);
    });

    socket.on('stop typing', function(data){
        io.to(socket.name_room).emit("stop typing", data);
    });

    socket.on('search', function () {
        if (searchingX.length > searchingY.length) {
            searchingY.push(socket);
            console.log('X = ' + searchingX.length);
            console.log('Y = ' + searchingY.length);
            var opponent = searchingX.shift();
            socket.musuh = opponent;
            opponent.musuh = socket;
            var name_room = opponent.username;
            console.log(name_room);
            socket.join(name_room);
            socket.name_room = name_room;
            socket.tipe = 'Y';
            searchingY.shift();
            questions[name_room] = [];
            Soal.find({}, function (err, soalsoal) {
                if (err) {
                    console.log(err);
                } else {
                    questions[name_room] = soalsoal;
                    console.log('kumpulan soal');
                    //console.log(questions);
                    current_soal = questions[name_room].shift();
                    io.to(name_room).emit('halo', 'hello room ' + name_room);
                }
            });
        }
        else {
            searchingX.push(socket);
            console.log('X = ' + searchingX.length);
            console.log('Y = ' + searchingY.length);
            socket.tipe = 'X';
            socket.join(socket.username);
            socket.name_room = socket.username;
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnect');
        if (!socket.username) return;
        delete user_game[socket.username];
        user_game.splice(user_game.indexOf(socket.username), 1);
        update_user();
    });

    function update_user() {
        io.sockets.emit('all user', Object.keys(user_game).length);
        console.log(user_game.length);
    }

    socket.on('successlogin', function (data) {
        if (data.username in user_game) {
            socket.emit('auth', 0);
        }
        else {
            console.log('huhu');
            socket.username = data.username;
            socket.emit('auth', 1);
            console.log(socket.username + " has login");
            user_game[socket.username] = socket;
//            user_game.push(socket.username);

            update_user();
        }
    });
    socket.on('ready wait', function(){
       socket.emit('ready wait all', socket.musuh.username);
    });
});

module.exports = app;