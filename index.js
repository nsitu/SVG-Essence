
const fs = require('fs');


const express = require('express');

// express middleware for uploading files.
const fileUpload = require('express-fileupload');

const {spawn} = require('child_process');
//const { exec } = require('child_process');

const app = express()
const PORT = process.env.PORT || 80

// serve up a static frontend.
app.use(express.static('public'))

app.use(fileUpload());

// folder to store uploads
const dir = __dirname+'/uploads';
console.log('lets confirm existence of ' + dir)
if (!fs.existsSync(dir)) fs.mkdirSync(dir); 


// Thanks:  https://stackoverflow.com/a/50243907/17929842
app.post('/upload', function(req, res) {
  let log = ['Processing File upload'];
  if (!req.files || Object.keys(req.files).length === 0) {
    log.push('No files were uploaded.');
    return res.status(400).json( log );
  } 
  let svg = req.files.file;
  let uploadFilePath = `${dir}/${svg.md5}.svg`;
  let outputFilePath = `${dir}/${svg.md5}_output.svg`;
  // Move the uploaded svg to the uploads folder.
  svg.mv(uploadFilePath, function(err) {
    if (err) { 
      log.push(err);
      return res.status(500).json(log)  
    } 
    try { 
      // let args = [
      //   '--verbose',
      //   'read', uploadFilePath,
      //   'scaleto', '23in', '23in',
      //   'linemerge', '--tolerance', '1in',
      //   'linesimplify', '--tolerance', '0.01in',
      //   'write', '--page-size', '24inx24in', '--center',
      //   outputFilePath
      // ]  
      let args = [
        '--verbose',
        'read', uploadFilePath,
        'linemerge',
        'linesimplify',
        'write', 
        outputFilePath
      ]  
      const vpype = spawn('vpype', args );
      log.push('SPAWNING: vpype '+args.join(' '));

      //if there is any output, record it
      vpype.on('error', (err) => log.push('Failed to start vpype', err) )
      vpype.stdout.on('data', (data) => log.push(data.toString('utf8')) )
      vpype.stderr.on('data', (data) =>  log.push(data.toString('utf8')) )
      vpype.on('close', (code, signal) => {
        log.push(code)
        log.push(signal)
        log.push(`vpype child process closed all stdio with code ${code}`)
        res.json({
          "log" : log, 
          "name": svg.name,  
          "datetime": new Date().toLocaleString(),
          "url" : "/download/"+svg.md5,
        })
      })
    } 
    catch(err) {
      log.push(err);
      return res.status(500).json(log)   
    } 
  })
})
 
app.get('/download/:md5', (req, res) => {  
  let originalFilePath = dir+'/'+req.params.md5+'.svg';
  let downloadFilePath = dir+'/'+req.params.md5+'_output.svg';
  if (!fs.existsSync(downloadFilePath)){
    res.status(404).send("Requested File Does Not Exist");
  }

  res.sendFile(downloadFilePath, (err) => {
    if (err){ 
      console.log(err) 
    } 
    else{ 
      console.log('File was downloaded', downloadFilePath) 
      fs.unlink(downloadFilePath, (err) => console.log("File was deleted", downloadFilePath, err)  )
      fs.unlink(originalFilePath, (err) => console.log("File was deleted", originalFilePath, err) ) 
    }
  })

})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))