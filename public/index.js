
let uploadedSVG = '';
 
const dragAndDrop = document.getElementById('dragAndDrop'); 

// Check if browser supports file drag and drop
if (typeof window.FileReader === 'undefined') {
    // notify users that browser does not support file drag and drop 
    dragAndDrop.innerHTML = '<p>Sorry, drag and drop is not working.</p>';
} else {
    // provide instructions for drag and drop. 
    dragAndDrop.innerHTML = '<p>Drag and drop an .svg file here.</p>';
}

// hover styling for drag and drop
dragAndDrop.ondragover = function() {
    this.className = 'hover';
    return false;
}
dragAndDrop.ondragend = function() {
    this.className = '';
    return false;
}

dragAndDrop.ondrop = function(e) { 
    this.className = '' 
    e.preventDefault()
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader 
    // FileReader asynchronously reads files (or raw data buffers) using File or Blob objects
    let file = e.dataTransfer.files[0]

    // mime types are lowercase https://w3c.github.io/FileAPI/#dfn-type
    if (file.type != "image/svg+xml"){
        alert("Sorry, you can't upload that. It is not an SVG file.");
    }
    else{
        let formData = new FormData()
        formData.append('file', file) 
        fetch('/upload', {  method: 'POST',  body: formData  })
            .then(response => response.json())
            .then((status) => showStatus(status) )
            .catch((err) => { console.log('upload error', err); })
    } 
    return false;
};
 
function showStatus(status){

    let statusBox = document.getElementById('status'); 
    statusBox.innerHTML= 'SVG Has been uploaded.';
    console.log('finished upload', status);
 

    const svgContainer = document.getElementById('svgContainer'); 

    fetch(status.url)
        .then(response => response.text())
        .then(svg => {
            svgContainer.innerHTML = svg
            svgContainer.style.display = "block"
        })
        .catch(console.error.bind(console));

}
 
    
  