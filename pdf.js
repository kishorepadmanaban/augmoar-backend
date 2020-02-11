var PDF = require('pdfkit');            //including the pdfkit module
var fs = require('fs');
var text = 'ANY_TEXT_YOU_WANT_TO_WRITE_IN_PDF_DOC';

doc = new PDF();                        //creating a new PDF object
doc.pipe(fs.createWriteStream('PATH_TO_PDF_FILE'));  //creating a write stream 
            //to write the content on the file system
doc.text(text, 100, 100);             //adding the text to be written, 
            // more things can be added here including new pages
doc.end(); //we end the document writing.