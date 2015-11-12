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
var matchRoute = require('./routes/match');

var cors = require('cors');
//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*:*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

    next();
};

var app = express();
var sX = require('http').createServer(app);
//app.use(cors);
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
var dbName = 'CerdasCermat';
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
var Match = require('./models/match');

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
app.use('/api/match', matchRoute);

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
var io = require('socket.io').listen(sX, { origins: '*:*' });
io.set("origins","*:*");
var debug = require('debug')('cerdascermat');
sX.listen(process.env.PORT || 3000);
app.set('port', process.env.PORT || 3000);
app.use(allowCrossDomain);
//var server = app.listen(app.get('port'), function () {
//    console.log('Express server listening on port ' + server.address().port);
//});


//io.configure(function () {
//    io.set("transports", ["xhr-polling"]);
//    io.set("polling duration", 10);
//});
//socket = new io.Socket();

var user_game = [];
var questions = [];
var questionsBabak2 = [];
var questionsBabak3 = [];
var room = [];
var searchingX = [];
var searchingY = [];
var numbers = [];

io.sockets.on('connection', function (socket) {
    console.log("New client conected");
    var current_soal = [];
    var ready = 0;
    var counterBabak2 = 1;
    var counterBabak3 = 1;
    var jumlahTotalSoal = 32;
    var jmlSoal1 = 4;
    var jmlSoal2 = 12;
    var jmlSoal3 = 28;
    var jmlSoalPilih2 = 4;
    var jmlSoalPilih3 = 8;
    var penambahanBabak1 = 10;
    var penambahanBabak2 = 20;
    var penambahanBabak3 = 30;

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
                'soal': current_soal
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
            if (data.time > 1 && data.answer != 'noFight' && data.answer != 'noAnswer') {
                var benar = "";
                var tipe = "";
                var shiftUser = "";
                Soal.find({'_id': data._id}).exec(function (err, bX) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (bX[0].answer == data.answer) {
                            benar = '1';
                            var poin;
                            if (data.username == socket.username) {
                                poin = socket.poin = socket.poin + penambahanBabak1;
                            }
                            else {
                                poin = socket.musuh.poin = socket.musuh.poin + penambahanBabak1;
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
                });
            }
            else {
                io.to(socket.name_room).emit("noAnswer", data.username);
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
                setTimeout(function () {
                    current_soal = questions[socket.name_room].shift();
                    var dtQuestion = {
                        'user': shiftUser.username,
                        'tipe': tipe,
                        'soal': current_soal
                    };
                    console.log('mengirim soal babak 1 ke ' + dtQuestion.user);
                    io.to(socket.name_room).emit("soal babak 1", dtQuestion);
                }, 2000);
            }
            else {
                setTimeout(function () {
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
            var unm = '';

            if (data.answer == 'noChoose') { // jika user tidak memilih maka penambahan poin lawan
                benar = 1;
                if (data.username == socket.username) {
                    poin = socket.musuh.poin = socket.musuh.poin + penambahanBabak2;
                    unm = socket.musuh.username;
                }
                else {
                    poin = socket.poin = socket.poin + penambahanBabak2;
                    unm = socket.username;
                }

                var dt = {
                    'username': unm,
                    'u': data.username,
                    'answer': data.answer,
                    'poin': poin
                };
                io.to(socket.name_room).emit('noChoose', dt);
            }
            else {
                Soal.find({'_id': data._id}).exec(function (err, soalsoal) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (data.answer == soalsoal[0].answer) {
                            benar = 1;
                            if (data.username == socket.username) {
                                poin = socket.poin = socket.poin + penambahanBabak2;
                            }
                            else {
                                poin = socket.musuh.poin = socket.musuh.poin + penambahanBabak2;
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
                io.to(socket.name_room).emit('result answered babak 2', dt);
            }

            if (counterBabak2 < jmlSoalPilih2) {
                counterBabak2++;
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
            socket.musuh.emit('other answer babak 2', data);
        }
    });

    socket.on('answer babak 3', function (data) {
        if (checkSecurity()) {
            if (socket.tipe == 'X') {
                if (data.time > 1 && data.answer != 'noFight' && data.answer != 'noAnswer') {
                    Soal.find({'_id': data._id}).exec(function (err, bX) {
                        var benar = "";
                        if (data.answer == bX[0].answer) {
                            benar = '1';
                            var poin;
                            if (data.username == socket.username) {
                                poin = socket.poin = socket.poin + penambahanBabak3;
                            }
                            else {
                                poin = socket.musuh.poin = socket.musuh.poin + penambahanBabak3;
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

                        console.log('poin ku(' + socket.musuh.username + ') : ' + socket.poin);
                        console.log('poin musuh (' + socket.musuh.username + ') : ' + socket.musuh.poin);
                        io.to(socket.name_room).emit('result answered babak 3', dt);
                    });
                }
                else {
                    if (data.answer === 'noFight') {
                        console.log('no fight');
                        io.to(socket.name_room).emit("noFight", data.username);
                    }
                    else if (data.answer === 'noAnswer') {
                        io.to(socket.name_room).emit("noAnswer", data.username);
                    }
                    else {
                        io.to(socket.name_room).emit("noAnswer", data.username);
                    }
                }
                if (counterBabak3 < jmlSoalPilih3) {
                    counterBabak3++;
                    setTimeout(function () {
                        console.log('babak 3 lanjut');
                        io.to(socket.name_room).emit('babak 3 lanjut', 'ok');
                    }, 2000);
                } else {


                    console.log('poin akhir ku(' + socket.musuh.username + ') : ' + socket.poin);
                    console.log('poin akhir musuh (' + socket.musuh.username + ') : ' + socket.musuh.poin);

                    setTimeout(function () {
                        var mm = new Match();
                        mm.u = [socket.username, socket.musuh.username];
                        mm.p = [socket.poin, socket.musuh.poin];
                        mm.save(function (err, ok) {
                            if (err) {
                                console.log('Error : ' + err);
                            }
                            else {
                                console.log('Data game tersimpan : ' + ok);
                            }
                        });
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
                        io.to(socket.name_room).emit("babak 3 done", dtBabak3);
                    }, 2000);
                }
            }
            else {
                socket.musuh.emit('other answer babak 3', data);
            }
        }
    });

    socket.on('ready babak 2', function () {
        socket.musuh.emit("ready other babak 2", 'ok');
    });

    socket.on('all ready babak 2', function () {
        if (socket.tipe == 'X') {
            //socket.poin = 0;
            //socket.musuh.poin = 0;

            questionsBabak2[socket.name_room] = [];
            //var numbers = [];
            //for (var x = 0; x < jumlahTotalSoal; x++) {
            //    numbers.push(x);
            //}
            //numbers.sort(function () {
            //    return 0.5 - Math.random()
            //});
            var funcs = [];
            var tempQuestion2 = [];

            function createfunc(i) {console.log("okok : "+numbers[socket.name_room][i]);
                return function () {
                    Soal.find({'no': numbers[socket.name_room][i]}, {'answer': 0}).exec(function (err, soalsoal) {
                        if (err) {
                            console.log(err);
                        } else {
                            tempQuestion2.push(soalsoal[0]);
                            if (tempQuestion2.length == (jmlSoal2-jmlSoal1)) {
                                questionsBabak2[socket.name_room] = tempQuestion2;
                                var data = {
                                    'user': socket.musuh.username,
                                    'tipe': 'X',
                                    'soal': questionsBabak2[socket.name_room]
                                };
                                io.to(socket.name_room).emit('pilihan soal', data);
                            }
                        }
                    });
                }
            }

            for (var c = jmlSoal1; c < jmlSoal2; c++) {
                funcs[c] = createfunc(c);
            }
            for (var d = jmlSoal1; d < jmlSoal2; d++) {
                funcs[d]();
            }

        }
    });

    socket.on('ready babak 3', function () {
        if (!socket.username) {
            socket.emit('logout', 'oyi');
        } else {
            socket.musuh.emit("ready other babak 3", 'ok');
        }
    });

    socket.on('all ready babak 3', function () {
        if (socket.tipe == 'X') {
            //socket.poin = 0;
            //socket.musuh.poin = 0;
            //var numbers = [];
            questionsBabak3[socket.name_room] = [];
            //for (var x = 0; x < jmlSoal3; x++) {
            //    numbers.push(x);
            //}
            //
            //numbers.sort(function () {
            //    return 0.5 - Math.random()
            //});
            var funcs = [];
            var tempQuestion3 = [];

            function createfunc(i) {
                return function () {
                    Soal.find({'no': numbers[socket.name_room][i]}, {'answer': 0}).exec(function (err, soalsoal) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            tempQuestion3.push(soalsoal[0]);
                            if (tempQuestion3.length == (jmlSoal3 - jmlSoal2)) {
                                var data = {
                                    'user': socket.username,
                                    'tipe': 'X',
                                    'soal': tempQuestion3
                                };
                                io.to(socket.name_room).emit('grid soal', data);
                                //console.log(data);
                            }
                        }
                    });
                };
            }

            for (var c = jmlSoal2; c < jmlSoal3; c++) {
                funcs[c] = createfunc(c);
            }
            for (var d = jmlSoal2; d < jmlSoal3; d++) {
                funcs[d]();
            }
        }
    });

    socket.on('open babak 3', function (data) {
        socket.musuh.emit('buka musuh', data);
    });

    socket.on('jawaban babak 1', function (data) {
        socket.musuh.emit('jawaban babak 1', data);
    });

    socket.on('jawaban babak 2', function (data) {
        socket.musuh.emit('jawaban babak 2', data);
    });

    socket.on('jawaban babak 3', function (data) {
        socket.musuh.emit('jawaban babak 3', data);
    });

    socket.on('pertanyaan pilihan', function (data) {
        var dtQuestion = {
            'user': socket.musuh.username,
            'soal': questionsBabak2[socket.name_room][data]
        };
        questionsBabak2[socket.name_room].splice(data, 1);
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
                numbers[socket.name_room] = [];
                for (var x = 0; x < jumlahTotalSoal; x++) {
                    numbers[socket.name_room].push(x);
                }
                numbers[socket.name_room].sort(function () {
                    return 0.5 - Math.random()
                });
                var funcBabak1 = [];
                var funcBabak2 = [];
                var funcBabak3 = [];
                var tempQuestion1 = [];
                var tempQuestion2 = [];
                var tempQuestion3 = [];

                function createBabak1(i) {
                    return function () {
                        Soal.find({'no': numbers[socket.name_room][i]}, {'answer': 0}).exec(function (err, soalsoal) {
                            if (err) {
                                console.log(err);
                            } else {
                                tempQuestion1.push(soalsoal[0]);
                                if (tempQuestion1.length == jmlSoal1) {
                                    questions[name_room] = tempQuestion1;
                                    current_soal = questions[name_room].shift();
                                    console.log('hello room dari ' + socket.username);
                                    io.to(name_room).emit('halo', 'hello room ' + name_room);
                                }
                            }
                        });
                    }
                }

                function createBabak2(i) {
                    return function () {
                        Soal.find({'no': numbers[i]}, {'answer': 0}).exec(function (err, soalsoal) {
                            if (err) {
                                console.log(err);
                            } else {
                                tempQuestion2.push(soalsoal[0]);
                                if (tempQuestion2.length == jmlSoal2) {
                                    questionsBabak2[socket.name_room] = tempQuestion2;
                                    var data = {
                                        'user': socket.musuh.username,
                                        'tipe': 'X',
                                        'soal': questionsBabak2[socket.name_room]
                                    };
                                    io.to(socket.name_room).emit('pilihan soal', data);
                                }
                            }
                        });
                    }
                }

                function createBabak3(i) {
                    return function () {
                        Soal.find({'no': numbers[i]}, {'answer': 0}).exec(function (err, soalsoal) {
                            if (err) {
                                console.log(err);
                            } else {
                                tempQuestion3.push(soalsoal[0]);
                                if (tempQuestion3.length == jmlSoal3) {
                                    var data = {
                                        'user': socket.username,
                                        'tipe': 'X',
                                        'soal': tempQuestion3
                                    };
                                    io.to(socket.name_room).emit('grid soal', data);
                                    //console.log(data);
                                }
                            }
                        });
                    }
                }

                for (var c = 0; c < jmlSoal1; c++) {funcBabak1[c] = createBabak1(c);
                    //if (c < jmlSoal1) {
                    //    funcBabak1[c] = createBabak1(c);
                    //}
                    //else if (c >= jmlSoal1 && c < jmlSoal2) {
                    //    funcBabak2[c] = createBabak2(c);
                    //}
                    //else if (c >= jmlSoal2 && c < jmlSoal3) {
                    //    funcBabak3[c] = createBabak3(c);
                    //}

                }
                for (var d = 0; d < jmlSoal1; d++) {
                    funcBabak1[d]();
                    //if (d < jmlSoal1) {
                    //    funcBabak1[d]();
                    //}
                    //else if (d >= jmlSoal1 && d < jmlSoal2) {
                    //    funcBabak2[c]();
                    //}
                    //else if (d >= jmlSoal2 && d < jmlSoal3) {
                    //    funcBabak3[d]();
                    //}
                }


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
        questions[socket.name_room] = undefined;
        socket.leave(socket.name_room);
        counterBabak2 = 1;
        counterBabak3 = 1;
        socket.name_room = undefined;
        socket.musuh = undefined;
        socket.poin = 0;
    });

    socket.on('wis bar', function () {
        socket.emit('wis bar');
    });

});

module.exports = app;
