# svg-essence-api (in progress)
A NodeJS API to flatten SVG files into simple line art.

# Background
I needed a mechanism to simplify SVG files.  I like [SVGO](https://github.com/svg/svgo) except for the fact that it [does not support baking of transforms](https://github.com/svg/svgo/issues/624). Instead I am using [vpype](https://github.com/abey79/vpype) which has all the right features. It is a Python script that runs on a server. I am making vpype it accessible via a NodeJS Express application, that works as a simple API:

## Upload SVG Files
* Listen for POST requests on the `/upload` endpoint.
* If an SVG file is uploaded, assign it an ID
* Save the upload (with the ID as filename) to a designated folder, e.g. `/input/{ID}.svg`
* Extract user preferences from the POST for this ID (e.g. vpype settings) and save them to MongoDB `{ID}`.
* Send the ID and preferences to Python for processing. 
* Send the ID back to the frontend with a successful upload message.

## Process Files
* Monitor for new uploads. 
* For each upload, get the ID, input filename, and preferences
* Generate a vpype command using the given SVG file path and preferences
* Spawn a Python process and run the command. 
* vpype transforms the SVG according to provided preferences (e.g. `scaleto`, `linemerge`, `linesimplify`, etc.)
* vpype saves the result in a designated output folder `/output/{ID}.svg`

## Track Progress
* NodeJS listens for GET requests on the `/status/{ID}` endpoint.
* If an ID is indicated, search for a matching file at `/output/{ID}.svg`
* If the file does not exist, return false
* If the file exists, update the status in MongoDB and return true;

## Track Progress (frontend)
* The frontend will periodically send a status request to `/status/{ID}`
* If the result is true, proceed to download the completed file.

## Download Result
* Listen for GET requests on the `/download/{ID}` endpoint.
* If there exists a completed file matching this request, send it. 

## example vpype command 
This scales up the SVG to fit in a two foot square (with a 1" margin"). It also simpifies and merges lines according to the given tolerances. For details see the [vpype reference](https://vpype.readthedocs.io/en/stable/reference.html)
`vpype read input.svg scaleto 23in 23in linemerge --tolerance 1in linesimplify --tolerance 0.01in write --page-size 24inx24in --center output.svg`
 
