const dotenv = require('dotenv').config(); // set enviroment processes
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware

app.use(bodyParser.urlencoded({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Index Route
app.get('/', (req, res) => {

  res.render('index')

});


// SendGrid middleware
var helper = require('sendgrid').mail;
var sg = require('sendgrid')(process.env.API_KEY);

app.post('/contact', (req, res) => {

  let errors = [];

  if (!req.body.userEmail) {
    errors.push({ text: 'Email Required' });
  } if (!req.body.userName) {
    errors.push({ text: 'Name Required' });
  } if (!req.body.subject) {
    errors.push({ text: 'Subject Required' });
  } if (!req.body.content) {
    errors.push({ text: 'Please include a message' });
  }

  if (errors.length > 0) {
    res.render('index', {
      errors: errors,
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      subject: req.body.subject,
      content: req.body.content,

    });
  } else {

    var fromEmail = new helper.Email(req.body.userEmail);
    var toEmail = new helper.Email('lmorgans90@gmail.com');
    var subject = req.body.subject + " From " + req.body.userName;
    var content = new helper.Content('text/plain', req.body.content);
    var mail = new helper.Mail(fromEmail, subject, toEmail, content);

    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
      if (error) {
        console.log('Error response received');
        req.flash('error_msg', 'Oops! please try again.')
      } else {
        req.flash('success_msg', 'Your Message has been sent');
        res.redirect('/');
   
      }
    });
  }
}); 

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});