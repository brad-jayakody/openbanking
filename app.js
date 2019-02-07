var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var session = require('express-session');
const axios = require('axios')
var bodyParser = require('body-parser')

var app = express();

var userToken;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const storage = require('node-persist');

app.use(session({
  secret: "top secret",
  resave: false,
  saveUnitialised: true,
  cookie: {secure : false }
}));

//app.use('/', indexRouter);
app.use('/users', usersRouter);

/* GET New User page. */
app.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

/* POST to Login */

app.post('/login', function(req, res) {

	//var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"ellie.uk.29@example.com\", password=\"a81594\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	//var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"Robert.Us.01\", password=\"X!39670561\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	//var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"robert.uk.29@example.com\", password=\"d9c663\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	//var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"susan.uk.29@example.com\", password=\"2b78e8\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	//var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"roberto.it.29@example.com\", password=\"6a463a\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}

	var headers = "";

	if (req.body.username === "" && req.body.password === "") {
		headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"roberto.it.29@example.com\", password=\"6a463a\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}
	} else {
		headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin username=\"' + req.body.username + '\", password=\"' + req.body.password + '\", consumer_key=\"py2u2sl2n44xwrel0kc5wewye2ywf5tcjeryugce\"'}
	}

	axios.post('https://apisandbox.openbankproject.com/my/logins/direct', {}, {headers: headers})
	  .then(function (response) {
		console.log('Successful');
		console.log(response.data.token);
		req.session.userToken = response.data.token;
		req.session.save();
		res.redirect('/userAccounts');
	  })
	  .catch(function (error) {
	    console.log(error);
  });

});

app.get('/userAccounts', function(req, res) {
    console.log('Token fun');
    console.log(req.session.userToken);

    var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin token="' +  req.session.userToken + '\"'}
    axios.get('https://apisandbox.openbankproject.com/obp/v3.1.0/my/accounts',  {headers: headers})
    .then(function (response) {
		res.locals.accounts = response.data.accounts;
		res.render('userAccounts', { title: 'userAccounts' });
	})
	 .catch(function (error) {
	    console.log(error);
	    res.render('userAccounts', { title: 'userAccounts' });
	})

});

app.get('/account_details', function(req, res) {

    var headers = {'Content-Type': 'application/json', 'Authorization': 'DirectLogin token="' +  req.session.userToken + '\"'}

    var account_id = req.query.account_id;
    var bank_id = req.query.bank_id;

    var url = "https://apisandbox.openbankproject.com/obp/v3.1.0/my/banks/" + bank_id + "/accounts/" + account_id +"/transactions"

    axios.get(url,  {headers: headers})
    .then(function (response) {
		//console.log(response.data);
		res.locals.transactions = response.data.transactions;

		var amount = Number(0);
		for(var i=0; i < response.data.transactions.length; i++) {
			if (response.data.transactions[i].details.value.amount < 0) {
				console.log(response.data.transactions[i].details.value.amount);
				console.log(Math.ceil(response.data.transactions[i].details.value.amount));
				console.log(Math.ceil(Math.abs(Number(response.data.transactions[i].details.value.amount))));
				console.log('--------------');
				amount= amount + Number(Math.ceil(Math.abs(Number(response.data.transactions[i].details.value.amount)))) + Number(response.data.transactions[i].details.value.amount);
				console.log(amount);
				console.log('--------------');
			}
		}

		amount = Math.floor(amount * 100) / 100;
		console.log(amount);

		res.locals.saveamount = amount;

		res.render('accountDetails', { title: 'accountDetails' });
	})
	 .catch(function (error) {
	    console.log(error);
	    res.render('accountDetails', { title: 'accountDetails' });
	})

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
