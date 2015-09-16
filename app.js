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
};

var app = express();
//app.use(cors);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(allowCrossDomain);
app.use(bodyParser.json());
var dbName = 'cerdascermat';
//var connectionString = 'mongodb://localhost:27017/' + dbName;
var connectionString = 'mongodb://ucup:segeralulus@ds041613.mongolab.com:41613/cerdascermat';

mongoose.connect(connectionString, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('connected to mongodb');
    }
});
var Soal = require('./models/question');
var User = require('./models/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
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
var questionsBabak2 = [];
var questionsBabak3 = [];
var room = [];
var searchingX = [];
var searchingY = [];

io.set('origins', '*');
io.sockets.on('connection', function (socket) {
    console.log("New client conected");
    var current_soal = [];
    var ready = 0;
    var counterBabak2 = 1;
    var counterBabak3 = 1;

    function checkSecurity() {
        if (!socket.username) {
            socket.emit('logout', 'oyi');
            return false;
        }
        return true;
    }

    socket.on('ready tab', function () {
        socket.emit('my data', {'mypoin': socket.totalPoin});
    });

    socket.on('ready babak 1', function () {
        console.log(socket.username + " dengan tipe " + socket.tipe + " babak 1 siap");
        io.to(socket.name_room).emit("ready other babak 1", 'ok');
    });

    socket.on('all ready babak 1', function () {
        console.log('aku ' + socket.username + ' dengan tipe ' + socket.tipe + ' all ready babak 1');
        if (socket.tipe == 'Y') {
            var data = {
                'user': socket.username,
                'tipe': 'Y',
                'soal': {
                    'id': current_soal.id,
                    'pertanyaan': current_soal.question
                }
            };
            console.log('giliran pertama babak 1 ' + socket.username + " dengan tipe " + socket.tipe);
            io.to(socket.name_room).emit("soal babak 1", data);
        }
    });

    socket.on('ready wait', function () {
        console.log('ready wait on');
        socket.musuh.emit('ready wait other', {'username': socket.username, 'poin': socket.poin});
    });

    socket.on('all ready wait', function () {
        if (socket.tipe == 'X') {
            io.to(socket.name_room).emit("ready wait all", 'ok');
        }
    });

    socket.on('ready opponent', function () {
        socket.emit('ready opponent all', socket.musuh.username);
    });

    socket.on('logout', function () {
        if (!socket.username) return;
        delete user_game[socket.username];
        user_game.splice(user_game.indexOf(socket.username), 1);
    });

    socket.on('answer babak 1', function (data) {
        if (socket.tipe == 'Y') {
            if (data.time > 1) {
                var benar = "";
                var tipe = "";
                var shiftUser = "";
                if (data.answer.toLowerCase() == current_soal.answer.toLowerCase()) {
                    benar = '1';
                    var poin;
                    if (data.username == socket.username) {
                        poin = socket.poin = socket.poin + 10;
                    }
                    else {
                        poin = socket.musuh.poin = socket.musuh.poin + 10;
                    }
                }
                else {
                    benar = '0';
                    if (data.username == socket.username) {
                        poin = socket.poin;
                    }
                    else {
                        poin = socket.musuh.poin;
                    }
                }

                var dt = {
                    'isbenar': benar,
                    'username': data.username,
                    'answer': data.answer,
                    'poin': poin
                };
                io.to(socket.name_room).emit('result answered babak 1', dt);
            }
            else {
                io.to(socket.name_room).emit("timeout", data.username);
            }
            if (data.tipe == "Y") {
                tipe = "X";
                shiftUser = socket.musuh;
            }
            else {
                tipe = "Y";
                shiftUser = socket;
            }
            if (questions[socket.name_room].length >= 1) {
                current_soal = questions[socket.name_room].shift();
                var dtQuestion = {
                    'user': shiftUser.username,
                    'tipe': tipe,
                    'soal': {
                        'id': current_soal.id,
                        'pertanyaan': current_soal.question
                    }
                }
                setTimeout(function () {
                    console.log('mengirim soal babak 1 ke ' + dtQuestion.user);
                    io.to(socket.name_room).emit("soal babak 1", dtQuestion);
                }, 2000);
            }
            else {
                var dtBabak1 = [
                    {
                        'username': socket.username,
                        'poin': socket.poin
                    },
                    {
                        'username': socket.musuh.username,
                        'poin': socket.musuh.poin
                    }
                ];
                setTimeout(function () {
                    io.to(socket.name_room).emit("babak 1 done", dtBabak1);
                }, 2000);
            }
        }
        else {
            console.log('mengirim jawabanku ke ' + socket.musuh.username + ' dengan tipe ' + socket.musuh.tipe + ' > aku ' + socket.username + ' dengan tipe ' + socket.tipe);
            socket.musuh.emit('other answer babak 1', data);
        }
    });

    socket.on('answer babak 2', function (data) {
        if (socket.tipe == 'X') {
            var poin = 0;
            var benar = "";
            //bonus meant that user not choose a question
            if (data.answer == 'bonus') {
                benar = 1;
                if (data.username == socket.username) {
                    poin = socket.poin = socket.poin + 20;
                }
                else {
                    poin = socket.musuh.poin = socket.musuh.poin + 20;
                }
                ok();
            }
            else {
                Soal.find({'_id': data._id}).exec(function (err, soalsoal) {
                    console.log(data.answer.toLowerCase() + ' = ' + soalsoal[0].answer.toLowerCase());
                    if (data.answer.toLowerCase() == soalsoal[0].answer.toLowerCase()) {
                        benar = 1;
                        if (data.username == socket.username) {
                            poin = socket.poin = socket.poin + 20;
                        }
                        else {
                            poin = socket.musuh.poin = socket.musuh.poin + 20;
                        }
                        ok();
                    }
                    else {
                        benar = 0;
                        if (data.username == socket.username) {
                            poin = socket.poin;
                        }
                        else {
                            poin = socket.musuh.poin;
                        }
                        ok();
                    }
                });
            }

            function ok() {
                var dt = {
                    'isbenar': benar,
                    'username': data.username,
                    'answer': data.answer,
                    'poin': poin
                };
                console.log('mengirim ke result answered');
                io.to(socket.name_room).emit('result answered babak 2', dt);
            }

            if (counterBabak2 < 2) {
                console.log("sebelum = " + counterBabak2);
                counterBabak2++;
                console.log("sesudah = " + counterBabak2);
                var dota = "";
                if (data.tipe == 'X') {
                    dota = {
                        'user': socket.username,
                        'tipe': 'Y',
                        'soal': questionsBabak2[socket.name_room]
                    }
                }
                else {
                    dota = {
                        'user': socket.musuh.username,
                        'tipe': 'X',
                        'soal': questionsBabak2[socket.name_room]
                    }
                }
                //console.log(dota);
                setTimeout(function () {
                    io.to(socket.name_room).emit("pilihan soal", dota);
                }, 2000);
            }
            else {
                setTimeout(function () {
                    var dtBabak2 = [
                        {
                            'username': socket.username,
                            'poin': socket.poin
                        },
                        {
                            'username': socket.musuh.username,
                            'poin': socket.musuh.poin
                        }
                    ];
                    console.log(dtBabak2);
                    io.to(socket.name_room).emit("babak 2 done", dtBabak2);
                }, 2000);
            }
        }
        else {
            console.log('mengirim ke babak 2 dari ' + socket.username + ' ke ' + socket.musuh.username);
            socket.musuh.emit('other answer babak 2', data);
            console.log('aku X');
        }
    });

    socket.on('answer babak 3', function (data) {
        if (checkSecurity()) {
            if (socket.tipe == 'X') {

                if (data.time > 1 && data.answer != 'noFight' && data.answer != 'noAnswer') {
                    Soal.find({'_id': data._id}, {'benar': 1}).exec(function (err, bX) {
                        var benar = "";
                        if (data.answer == bX.benar) {
                            benar = '1';
                            var poin;
                            if (data.username == socket.username) {
                                poin = socket.poin = socket.poin + 10;
                            }
                            else {
                                poin = socket.musuh.poin = socket.musuh.poin + 10;
                            }
                        }
                        else {
                            benar = '0';
                            if (data.username == socket.username) {
                                poin = socket.poin;
                            }
                            else {
                                poin = socket.musuh.poin;
                            }
                        }

                        var dt = {
                            'isbenar': benar,
                            'username': data.username,
                            'answer': data.answer,
                            'poin': poin,
                            'no': data.no
                        };
                        io.to(socket.name_room).emit('result answered babak 3', dt);

                    });
                }
                else {
                    if (data.answer === 'noFight') {
                        io.to(socket.name_room).emit("noFight", data.username);
                    }
                    else if (data.answer === 'noAnswer') {
                        io.to(socket.name_room).emit("noAnswer", data.username);
                    }
                    else {
                        io.to(socket.name_room).emit("noAnswer", data.username);
                    }
                }
                if (counterBabak3 < 10) {
                    counterBabak3++;
                    setTimeout(function () {
                        console.log('babak 3 lanjut');
                        //io.to(socket.name_room).emit('babak 3 lanjut', 'ok');
                    }, 2000);

                } else {
                    var dtBabak3 = [
                        {
                            'username': socket.username,
                            'poin': socket.poin
                        },
                        {
                            'username': socket.musuh.username,
                            'poin': socket.musuh.poin
                        }
                    ];
                    setTimeout(function () {
                        console.log('babak selesai');
                        io.to(socket.name_room).emit("babak 3 done", dtBabak3);
                    }, 2000);
                }
            }
            else {
                console.log('mengirim jawabanku ke ' + socket.musuh.username + ' dengan tipe ' + socket.musuh.tipe + ' > aku ' + socket.username + ' dengan tipe ' + socket.tipe);
                socket.musuh.emit('other answer babak 3', data);
            }
        }
    });

    socket.on('ready babak 2', function () {
        //if (!socket.username) {
        //    socket.emit('logout', 'oyi');
        //} else {
        console.log(socket.username + " babak 2 siap >> ");
        socket.musuh.emit("ready other babak 2", 'ok');
        console.log('mengirim ready other ke ' + socket.musuh.username);
        //}
    });

    socket.on('all ready babak 2', function () {
        console.log('aku ' + socket.username + ' dengan tipe ' + socket.tipe + ' all ready babak 2');
        if (socket.tipe == 'X') {
            socket.poin = 0;
            socket.musuh.poin = 0;
            Soal.find().limit(6).exec(function (err, soalsoal) {
                if (err) {
                    console.log(err);
                } else {
                    questionsBabak2[socket.name_room] = soalsoal;
                    var data = {
                        'user': socket.musuh.username,
                        'tipe': 'X',
                        'soal': questionsBabak2[socket.name_room]
                    }
                    //socket.emit("pilihan soal", soalsoal);
                    console.log('aku ' + socket.username + ' dengan tipe ' + socket.tipe + ' mengirim pilihan soal');

                    io.to(socket.name_room).emit('pilihan soal', data);
                }
                ;
            });
        }
    });

    socket.on('ready babak 3', function () {
        if (!socket.username) {
            socket.emit('logout', 'oyi');
        } else {
            console.log(socket.username + " tipe " + socket.tipe + " babak 3 siap >> ");
            socket.musuh.emit("ready other babak 3", 'ok');
            console.log('mengirim ready other ke ' + socket.musuh.username + " tipe " + socket.musuh.tipe);
        }
    });

    socket.on('all ready babak 3', function (data) {
        if (socket.tipe == 'X') {
            socket.poin = 0;
            socket.musuh.poin = 0;
            var numbers = [];
            questionsBabak3[socket.name_room] = [];
            for (var x = 0; x < 18; x++) {
                numbers.push(x);
            }

            numbers.sort(function () {
                return 0.5 - Math.random()
            });
            var funcs = [];
            var tempQuestion3 = [];

            function createfunc(i) {
                return function () {
                    Soal.find({'no': numbers[i]}, {'benar': 0}).exec(function (err, soalsoal) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            tempQuestion3.push(soalsoal[0]);
                            if (tempQuestion3.length == 16) {
                                var data = {
                                    'user': socket.username,
                                    'tipe': 'X',
                                    'soal': tempQuestion3
                                };
                                io.to(socket.name_room).emit('grid soal', data);
                            }
                        }
                    });
                };
            }

            for (var c = 0; c < 16; c++) {
                funcs[c] = createfunc(c);
            }
            for (var d = 0; d < 16; d++) {
                funcs[d]();
            }
        }
        else {
            console.log('aku ' + socket.username + ' menerima all ready === tipe ' + socket.tipe);
        }
    });

    socket.on('open babak 3', function (data) {
        socket.musuh.emit('buka musuh', data);
    });

    socket.on('pertanyaan pilihan', function (data) {
        var dtQuestion = {
            'user': socket.musuh.username,
            'soal': {
                'id': questionsBabak2[socket.name_room][data]._id,
                'pertanyaan': questionsBabak2[socket.name_room][data].question
            }
        };
        questionsBabak2[socket.name_room].splice(data, 1);
        console.log('mengirim pertanyaan ke musuh');
        console.log(dtQuestion);
        io.to(socket.name_room).emit('jawaben rek', dtQuestion);
    });

    socket.on('typing', function (data) {
        io.to(socket.name_room).emit("typing", data);
    });

    socket.on('stop typing', function (data) {
        io.to(socket.name_room).emit("stop typing", data);
    });

    socket.on('timeout', function (data) {
        io.to(socket.name_room).emit("timeout", data);
    });

    socket.on('search', function () {
        console.log('aku ' + socket.username + ' mencari musuh');
        if (socket.username == undefined) {
            console.log('sending logout');
            socket.emit('logout');
        }
        else {
            if (searchingX.length > searchingY.length) {
                searchingY.push(socket);
                console.log('X = ' + searchingX.length);
                console.log('Y = ' + searchingY.length);
                var opponent = searchingX.shift();
                if (socket.username == opponent.username) {
                    return;
                }
                socket.musuh = opponent;
                console.log(socket.username + ' melawan ' + socket.musuh.username);
                socket.poin = 0;
                opponent.musuh = socket;
                socket.musuh.poin = 0;
                var name_room = opponent.username;
                console.log(name_room + " room created");
                if (name_room == undefined) {
                    return;
                }
                socket.join(name_room);
                socket.name_room = name_room;
                socket.tipe = 'Y';
                searchingY.shift();
                questions[name_room] = [];
                Soal.find().limit(2).exec(function (err, soalsoal) {
                    if (err) {
                        console.log(err);
                    } else {
                        questions[name_room] = soalsoal;
                        //console.log('kumpulan soal');
                        //console.log(questions);
                        current_soal = questions[name_room].shift();
                        console.log('hello room dari ' + socket.username);
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
        console.log(Object.keys(user_game).length);
    }

    socket.on('successlogin', function (data) {
        if (data.username in user_game) {
            socket.emit('auth', 0);
        }
        else {
            console.log('huhu');
            socket.username = data.username;
            User.find(data).exec(function (err, dataUser) {
                if (err) {
                    console.log(err);
                }
                else {
                    socket.totalPoin = dataUser[0].jumlah_poin;
                }
            });
            socket.emit('auth', 1);
            console.log(socket.username + " has login");
            user_game[socket.username] = socket;
//            user_game.push(socket.username);

            update_user();
        }
    });

    socket.on('game done', function (data) {
        console.log('game done : ' + data);
        socket.leave(socket.name_room);
        //setTimeout(function(){console.log('sending cek aja');
        //
        //}, 15000);
        //io.to(socket.name_room).emit('cek aja', 'ok');
        socket.name_room = undefined;
        socket.musuh = undefined;
        socket.poin = 0;
    });

    socket.on('wis bar', function () {
        //if(socket.tipe === 'X'){
        //    io.to(socket.name_room).emit('wis bar', 'ok');
        //}
        socket.emit('wis bar');
    });

});

module.exports = app;