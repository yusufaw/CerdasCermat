/**
 * Created by ucup_aw on 07/02/15.
 */

var Question = require('../models/question');
var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res) {
        Question.find().exec(function(err, questions) {
            if (err) {
                return res.send(err);
            }
            res.json(questions);
        });
    })
    .post(function(req, res) {
        var question = new Question(req.body);

        question.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.send({ message: 'Question Added' });
        });
    });

router.route('/:id').put(function(req,res){
    Question.findOne({ _id: req.params.id }, function(err, question) {
        if (err) {
            return res.send(err);
        }

        for (prop in req.body) {
            question[prop] = req.body[prop];
        }

        // save the movie
        question.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.json({ message: 'Question updated!' });
        });
    });
});

router.route('/:id').get(function(req, res) {
    Question.findOne({ _id: req.params.id}, function(err, question) {
        if (err) {
            return res.send(err);
        }

        res.json(question);
    });
});

router.route('/:id').delete(function(req, res) {
    Question.remove({
        _id: req.params.id
    }, function(err, question) {
        if (err) {
            return res.send(err);
        }

        res.json({ message: 'Successfully deleted' });
    });
});

module.exports = router;