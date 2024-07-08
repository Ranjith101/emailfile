const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-email', async (req, res) => {
  const { to, subject, text, fileUrl } = req.body;
console.log(req.body,"req")
  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    return res.status(400).send('Invalid file URL');
  }

  try {
    // Download the file
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const fileName = path.basename(fileUrl);
    const filePath = path.join(__dirname, 'downloads', fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('finish', async () => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ranjithams78@gmail.com',
            pass: 'xayr cgow wtcq nnwb'
        }
      });

      const mailOptions = {
        from: 'ranjithams78@gmail.com',
        to,
        subject,
        text,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }

        fs.unlinkSync(filePath);
        res.status(200).send('Email sent: ' + info.response);
      });
    });

    writer.on('error', (error) => {
      res.status(500).send('File download failed: ' + error.toString());
    });

  } catch (error) {
    res.status(500).send('Error downloading the file: ' + error.toString());
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
