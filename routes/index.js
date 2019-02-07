var express = require('express');
var router = express.Router();

const axios = require('axios')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET New User page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});


router.get('/userAccounts', function(req, res) {
    console.log('Token fun');
    sess=req.session;
    //console.log(sess.userToken);
    res.render('userAccounts', { title: 'userAccounts' });

});



/* POST to Login */

router.post('/login', function(req, res) {
	console.log('Woah');
	console.log(req.body.username);

	var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"ellie.uk.29@example.com\", password=\"a81594\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	axios.post('https://apisandbox.openbankproject.com/my/logins/direct', {}, {headers: headers})
	  .then(function (response) {
		console.log('Successful');
		console.log(req.session.id);
		sess=req.session;
		sess.userToken = response.data.token;
		console.log(sess.userToken);
	  //  console.log(response.data.token);
	  })
	  .catch(function (error) {
	    console.log(error);
  });
  	res.redirect('/userAccounts');
 	//res.render('userAccounts', { title: 'UserAccounts' });

});

module.exports = router;
