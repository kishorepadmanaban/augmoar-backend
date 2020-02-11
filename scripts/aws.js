const fs = require('fs');
const AWS = require('aws-sdk');

// Enter copied or downloaded access id and secret here
const ID = 'AKIA5VG6EYROWUJKFHPC';
const SECRET = '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';

// Enter the name of the bucket that you have created here
const BUCKET_NAME = 'augmo-platform';;


// Initializing S3 Interface
const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const uploadFile = (file, name, cb) => {
    // read content from the file
    const fileContent = fs.readFileSync(file);
    
    // setting up s3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: name, // file name you want to save as
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
          console.log(err)
          cb(false)
            throw err
        }
        console.log(`File uploaded successfully. ${data.Location}`)
        cb(true, data.Location)
    });
};

module.exports = uploadFile