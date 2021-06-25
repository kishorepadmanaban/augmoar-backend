const fs = require('fs');
const AWS = require('aws-sdk');


const uploadFile = (file, name, cb) => {
    // Enter copied or downloaded access id and secret here
    const ID = process.env.AWS_ACCESS_KEY_ID;
    const SECRET = process.env.AWS_SECRET_ACCESS_KEY;
    
    // Enter the name of the bucket that you have created here
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    
    
    // Initializing S3 Interface
    const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: SECRET
    });
    
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