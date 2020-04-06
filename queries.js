var http = require('http');
var url = require('url');
const express = require('express');
const mysql = require('mysql');
var fs = require('fs');


// Creating server for index 
http.createServer(function (req, res) {
  fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}).listen(8000);


http.createServer(function (req, res) {
    // Get the first GET-param
    var first_get_param = req.url.split("/")[1].split("=")[1];
    // Check that ? exists in the requested url to verify that GET-data exists
    if(req.url.indexOf('?') !== -1) {
        console.log('GET-param: ' + first_get_param);
        // Insert the record and parse results
        insert_poll_op(first_get_param, res);
    }
}).listen(3001);

//-----------------------------------------------------------------------------------------
// Insert poll option into database
function insert_poll_op(poll_option, res){

    // Create connection
    const db = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'digipool_polls'
    });
    // Connect to database
    db.connect((err) => {
        if(err){
            throw err;
        } else {
            console.log('Database Connection successfull');
            // Insert into the database
            // If poll_option actually exists add it to the database
            if(poll_option != null || poll_option != "") {
                console.log('Poll option: ' + poll_option);
                db.query('INSERT INTO polls VALUES (DEFAULT, "' + poll_option + '")');    
                console.log('Inserted new record!');
            }  
            // Select the results and send them to the results_page function
            db.query("SELECT value,COUNT(id) as eachvalue FROM polls GROUP BY value ORDER BY eachvalue "  , function (err, result, fields) {
                if(err) throw err;
                console.log('Queried results!');
                console.log(result);
                results_page(result, res);
            });
        }
    });
}

//-----------------------------------------------------------------------------------------
// Function to show the results
function results_page(results, res){
    let ejs = require('ejs');
    
    var htmlresponse =
       `<!DOCTYPE html>
       <html>
       <head>
       <title>Opinion Poll</title>
       <!-- Latest compiled and minified CSS -->
       <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
       
       
       
       <!-- jQuery library -->
       <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
       
       <!-- Popper JS -->
       <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
       
       <!-- Latest compiled JavaScript -->
       <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
       
       </head>
       <style>
        body{background-image: url("https://i.dlpng.com/static/png/6719466_preview.png"); background-size:cover;  }
       </style>
       <body>
           
           <main>
               <div class="container">
                   <br>
                   <div class="jumbotron text-center" style="margin-bottom:0" >
                       <h1> Results</h1>
                     </div>
                     <nav class="navbar navbar-expand-sm bg-dark navbar-dark"></nav>
                     <nav class="navbar navbar-expand-sm bg-success navbar-dark"></nav>
       
                   <form action="http://localhost:3001" method="GET">  
                       <div class="container">
                       <br>
       
       
       `;

       var resultString = '';
       // Looping through the results and adding them as comma-separated string to the html-response
       for(var i = 0; i < results.length; i++) {
           resultString += results[i]['value'] + ', ' + results[i]['eachvalue'] + ' votes<br>';
       }
       htmlresponse += resultString;
       htmlresponse += `

       <br>
       </div>
        <div class="jumbotron text-center" style="margin-bottom:0">
        <h3> Thank you for your answer!</h3>          
         </div>               
   </form>
</main>
<br> <p style="text-align: center"> Developed by: Oleksandr Zakirov</p>
</body>
<script src= "queries.js>"></script>
</html>
`;
       console.log(htmlresponse);
       
       // Writing the result to browser
       res.writeHead(200, {'Content-Type': 'text/html'});
       res.end(htmlresponse);
   }
   
