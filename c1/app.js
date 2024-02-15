// mongodb+srv://aleksandar:<password>@cluster0.dle0u6v.mongodb.net/?retryWrites=true&w=majority
//tretchas
// YRzFP7MITu4YfYZo
const express = require('express');

const db = require('./pkg/db/index');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.init();

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log('Could not start service');
  }
  console.log(`Service started successfully on port ${process.env.PORT}`);
});
