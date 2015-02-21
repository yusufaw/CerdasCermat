/**
 * Created by ucup_aw on 20/02/15.
 */

var User = require('../models/user');
var express = require('express');
var router = express.Router();

router.route('/')
    .get(function(req, res, next) {
        User.find(function(err, users) {
            if (err) {
                return res.send(err);
            }
            res.json(users);
        });
        next();
    })
    .post(function(req, res) {
        var user = new User(req.body);

        user.save(function(err) {
            if (err) {
                return res.send(err);
            }

            res.send({ message: 'User Added' });
        });
    });

router.route('/cekusername/:username').get(function(req, res){
   User.findOne({username: req.params.username}, function(err, result){
      if(err){
          return res.send(err);
      }

       if(result!=null){
           res.send('1')
       }
       else{
           res.send('0');
       }
   });
});
module.exports = router;
