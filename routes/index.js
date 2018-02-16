var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var async = require('async');
var uid = require('uid-gen')

var Customer = require('../models/customer');
// var Customer = CustomerModel.Customer;

let options = { digits: "0123456789" }
let idgen = new uid.IDGenerator(options);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Sukumar Honkote\'s Upstox Backend Test' });
});

router.get('/customer', function (req, res) {
  res.json({ success: 1 })
});

router.post('/customer', function (req, res) {
  var input = req.body
  var customer = new Customer({
    customer_id: idgen.simple(12),
    email: input.email,
    joiningDate: new Date(),
  });

  if (undefined !== input.referral_id && null !== input.referral_id) {
    let referralId = input.referral_id;
  } else {
    Customer.create(customer, (err, doc) => {
      if (err) {
        throw err;
      } else {
        console.log('doc', doc);
        res.json(doc);
      }
    });
  }
});

// router.post('/insert_food', function (req, res) {
//   var food = new Food({
//     food: req.body.food,
//     hinglish_name: req.body.hinglish_name,
//     hindi_name: req.body.hindi_name,
//     energy: {
//       calories: req.body.calories,
//       unit: req.body.unit
//     },
//     nutrition: {
//       protein: s.getIntVal(req.body.protein),
//       carbohydrates: s.getIntVal(req.body.carbohydrates),
//       fat: s.getIntVal(req.body.fat),
//       fibre: s.getIntVal(req.body.fibre)
//     }
//   });
//   req.flash('majorFoodId', req.body.majorFoodId);
//   //$addToSet do not add the item to the given field if it already contains it, 
//   //on the other hand $push will add the given object to field whether it exists or not.
//   MajorFood.findByIdAndUpdate(req.body.majorFoodId, { $addToSet: { subdishes: food } }, { safe: true, upsert: true, new: true }, function (err, doc) {
//     if (err) {
//       res.json({ success: -1 });
//       return;
//     }

//     res.render('insert_food', {
//       majorFoodId: req.flash('majorFoodId'),
//       message: "successfully inserted " + req.body.hinglish_name
//     });

//     //adding data version increment
//     FoodDataVersion.update({}, { $inc: { food_data_version: 1 } }, function (err, doc) {
//       if (err) {
//         s.l("console couldn't");
//         return;
//       }

//     });
//   });
// });

module.exports = router;
