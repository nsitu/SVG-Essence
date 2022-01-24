
const fs = require('fs');


const express = require('express');

// express middleware for uploading files.
const fileUpload = require('express-fileupload');

const {spawn} = require('child_process');
//const { exec } = require('child_process');

const app = express()
const PORT = process.env.PORT || 5000

// serve up a static frontend.
app.use(express.static('public'))

app.use(fileUpload());


// Thanks:  https://stackoverflow.com/a/50243907/17929842
app.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    } 

    let svg = req.files.file;   

    let dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    
    let destination = `${dir}/${svg.md5}.svg`;
    // Move the uploaded svg to the uploads folder.
    svg.mv(destination, function(err) {
        if (err) return res.status(500).send(err) 
        // create a status report.
        let status = {
            "name": svg.name,
            "filepath": destination,
            "md5" :  svg.md5,
            "datetime": new Date().toLocaleString(),
            "status" : "File Uploaded",
        }
        // save the status to a sidecar JSON file
        fs.promises
            .writeFile('./uploads/'+svg.md5+'.json', JSON.stringify(status))
            .then(() => { 
                  try { 
                    let output = [];

                    let args = [
                       '--verbose',
                      'read', status.filepath,
                      'scaleto', '23in', '23in',
                      'linemerge', '--tolerance', '1in',
                      'linesimplify', '--tolerance', '0.01in',
                      'write', '--page-size', '24inx24in', '--center',
                      status.filepath+'_output.svg'
                  ]  

                  // exec(command.join(' '), (error, stdout, stderr) => {
                  //   if (error) {
                  //     console.error(`exec error: ${error}`);
                  //     return;
                  //   }
                  //   console.log(`stdout: ${stdout}`);
                  //   console.error(`stderr: ${stderr}`);
                  //   res.send(JSON.stringify(stdout))

                  // });


                    const vpype = spawn('vpype', args );

                    vpype.on('error', (err) => {
                      console.error('Failed to start subprocess.', err);
                    });

                    //if there is any output, record it
                    vpype.stdout.on('data', (data) =>  {
                      console.log(data.toString('utf8'))
                      output.push(data.toString('utf8')) 
                    })

                    vpype.stderr.on('data', (data) =>  {
                      console.log(data.toString('utf8'))
                      output.push(data.toString('utf8')) 
                    })
                    
                    vpype.on('close', (code, signal) => {
                      console.log('vpype '+args.join(' '));
                        console.log(output);
                        console.log(code);
                        console.log(signal);
                        console.log(`Child process closed all stdio with code ${code}`);
                        
                        // res.send(status) 
                        res.send(JSON.stringify(output))
                    });
                  } 
                  catch(err) {
                      console.error(err) 
                  }
                }
            )
            .catch(err =>  console.error(status, err) ) 

    });
  });
 

app.get('/', (req, res) => {
var largeDataSet = [];
 // spawn new child process to call the python script
 const python = spawn('python', ['script1.py']);
 // collect data from script
 python.stdout.on('data', function (data) {
  console.log('Pipe data from python script ...');
  largeDataSet.push(data);
 });
 // in close event we are sure that stream is from child process is closed
 python.on('close', (code) => {
 console.log(`child process close all stdio with code ${code}`);
 // send data to browser
 res.send(largeDataSet.join(""))
 });
 
})
app.listen(PORT, () => console.log(`Example app listening on port 
${PORT}!`))