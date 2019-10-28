const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

const files = require('./files.json');

app.use(cors());
app.use(morgan('combined'));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('/files', (_, res) => {
  res
    .status(200)
    .send(
      files.map(({ id, name, title }) => ({
        id,
        name,
        title
      }))
    )
    .end();
});

app.get('/file', async (req, res) => {
  const { id, pwdHash } = req.query;
  const file = files.find(f => f.id === id);
  if (!file) {
    res
      .status(400)
      .send({
        reason: `file with id ${id} doesn't exist`
      })
      .end();
    return;
  }
  const match = await bcrypt.compare(file.password, pwdHash);
  if (!match) {
    res
      .status(400)
      .send({
        reason: `wrong password`
      })
      .end();
    return;
  }
  console.log(file);
  res.status(200).download(`./files/${file.name}`);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
});

app.listen(port, () =>
  console.log(`File Sharing Server listening on port ${port}!`)
);
