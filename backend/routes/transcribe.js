const express = require('express');

const multer = require('multer');

const fs = require('fs');

const axios = require('axios');

const FormData = require('form-data');

const router = express.Router();

const upload =
  multer({
    dest: 'uploads/'
  });

router.post(
  '/',
  upload.single('audio'),
  async (req, res) => {

    try {

      const form =
        new FormData();

      form.append(
        'audio',
        fs.createReadStream(
          req.file.path
        )
      );

      const response =
        await axios.post(
          'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
          fs.createReadStream(
            req.file.path
          ),
          {
            headers: {
              Authorization:
                `Token ${process.env.DEEPGRAM_API_KEY}`,
              'Content-Type':
                'audio/webm'
            }
          }
        );

      fs.unlinkSync(
        req.file.path
      );

      const transcript =
        response.data.results.channels[0]
        .alternatives[0]
        .transcript;

      res.json({
        transcript
      });

    } catch (err) {

      console.error(
        'Deepgram Error:',
        err.response?.data ||
        err.message
      );

      res.status(500).json({
        error:
          'Transcription failed'
      });

    }

  }
);

module.exports = router;