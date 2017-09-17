const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

app.use('/img', express.static('img'));
app.use('/lib', express.static('lib'));
app.use('/js', express.static('js'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
