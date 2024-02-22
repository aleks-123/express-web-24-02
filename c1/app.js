// mongodb+srv://aleksandar:<password>@cluster0.dle0u6v.mongodb.net/?retryWrites=true&w=majority
//tretchas
// YRzFP7MITu4YfYZo

//! npm install express-jwt
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('express-jwt');

const db = require('./pkg/db/index');

const movies = require('./handlers/moviehandler');
const auth = require('./handlers/authHandler');

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.init();

app.use(
  jwt
    .expressjwt({
      algorithms: ['HS256'],
      secret: process.env.JWT_SECRET,
      getToken: (req) => {
        if (
          req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
          return req.headers.authorization.split(' ')[1];
        }
        if (req.cookies.jwt) {
          return req.cookies.jwt;
        }
        return null; //Vo ovaj slucaj ako nemame isprateno token
      },
    })
    .unless({
      path: ['/api/v1/signup', '/api/v1/login', '/movies/:id'],
    })
);

app.post('/api/v1/signup', auth.signup);
app.post('/api/v1/login', auth.login);

app.get('/movies', movies.getAll);
app.get('/movies/:id', movies.getOne);
app.post('/movies', movies.create);
app.patch('/movies/:id', movies.update);
app.delete('/movies/:id', movies.delete);

app.post('/me', movies.createByUser);
app.get('/me', movies.getByUser);

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log('Could not start service');
  }
  console.log(`Service started successfully on port ${process.env.PORT}`);
});

//! Da se kreira sistem celos so logiranje registrinjae
//! Za oglasi
//! Samo registrinai lica da mozat da kreiraat pregleduvaat i updejtiraat oglasi

// app.use(
//   jwt
//     .expressjwt({
//       algorithms: ['HS256'],
//       secret: process.env.JWT_SECRET,
//       getToken: (req) => {
//         if (
//           req.headers.authorization &&
//           req.headers.authorization.split(' ')[0] === 'Bearer'
//         ) {
//           return req.headers.authorization.split(' ')[1];
//         }
//         if (req.cookies.jwt) {
//           return req.cookies.jwt;
//         }
//         return null; //Vo ovaj slucaj ako nemame isprateno token
//       },
//     })
//     .unless({
//       path: ['/api/v1/signup', '/api/v1/login', '/movies/:id'],
//     })
// );
