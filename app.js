require('dotenv').config();
require('./middlewares/passport.js');
const express = require('express');

const cors = require('cors');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
//* CREATE TABLE
// const { sequelize } = require('./models');
// sequelize.sync({ force: true });

const app = express();

app.use(cors());
app.use(express.json());

// routers
app.use('/users', userRoute);
app.use('/posts', postRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'resource not found on this server' });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: err.message });
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server running on port ${port}`));
// console.log(process.env.JWT_SECRET_KEY);

// app.listen(8001, () => console.log('sever running on port 8001'));
