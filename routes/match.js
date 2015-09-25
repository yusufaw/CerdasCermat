/**
 * Created by ucup_aw on 24/09/15.
 */
var Match = require('../models/match');
var express = require('express');
var router = express.Router();

router.route('/')
    .get(function (req, res) {
        Match.find(function (err, users) {
            if (err) {
                return res.send(err);
            }
            res.json(users);
        });
    })
    .post(function (req, res) {
        var user = new Match(req.body);

        user.save(function (err) {
            if (err) {
                return res.send(err);
            }

            res.send({ message: 'User Added' });
        });
    });

router.route('/u/:username').get(function (req, res) {
    Match.find({u: req.params.username}, function (err, result) {
        if (err) {
            return res.send(err);
        }

        if (result != null) {
            res.send(result)
        }
        else {
            res.send('0');
        }
    });
});

module.exports = router;
