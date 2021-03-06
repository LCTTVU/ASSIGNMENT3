// ###############################################################################
// Web Technology at VU University Amsterdam
// Assignment 3


//Set up Web server to start defining routes
const express = require("express");
const app = express();

//Setup sqlite database
const sqlite = require("sqlite3").verbose();

//Use Variable db to communicate to the database phones.db
let db = my_database('./phones.db');

//body-parser middleware to parse JSON data in the body of HTTP requests
const bodyParser = require("body-parser");
app.use(bodyParser.json());


app.get("/phones", function(req, res, next) {
	//Select all items from phones using asterisk (*)
	db.all("SELECT * FROM phones", [], function(err, rows) {
		if (err) {
			res.status(400).json({"error" : err.message});
			return;
		}
		return res.status(200).json({ rows });
	});
});


app.get("/phones/:id", function(req, res, next) {
	//Select item parameters that matches the ID in request URI
	db.all("SELECT id, image, brand, model, os, screensize FROM phones WHERE id=" + [req.params.id], function(err, row) {
		if (err) {
			res.status(400).json({"error" : err.message});
			return;
		}
		//if row is empty, return 404
		else if (row.length < 1) {
			res.status(404).json({});
			return;
		}
		return res.status(200).json({ row });
	});
})


app.post("/phones", function(req, res, next) {
	//Get item parameters from request body
	var item = req.body;
	db.run(`INSERT INTO phones (image, brand, model, os, screensize) VALUES (?,?,?,?,?)`,
	[item['image'], item['brand'], item['model'], item['os'], item['screensize']],
	function(err, result) {
		if (err) {
			res.status(400).json({"error" : err.message});
			return;
		}
		return res.status(201).json({ "id" : this.lastID });
	});
})


app.put("/phones/:id", function(req, res, next) {
	//Get item parameters from request body
	var item = req.body;
    db.run(`UPDATE phones SET image = ?, brand = ?, model = ?, os = ?, screensize = ? WHERE id = ?`,
	[item['image'], item['brand'], item['model'], item['os'],  item['screensize'], item['id']],
    function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
			//no changes = item not found
			else if (this.changes == 0) {
				res.status(404).json({});
				return;
			}
            return res.status(200).json({ "updated": this.changes });
    });
});


app.delete("/phones/:id", function(req, res, next) {
	db.run("DELETE FROM phones WHERE id=" + [req.params.id], function(err, row) {
		if (err) {
			res.status(400).json({"error" : err.message});
			return;
		}
		//no changes = item not found
		else if (this.changes == 0) {
			res.status(404).json({});
			return;
		}
		return res.status(200).json({"deleted" : this.changes});
	});
})


app.get("/test", function(req, res) {
    return res.status(200).json({ success: true});
});

app.listen(3000, function() {
    console.log("Web server up and running at http://localhost:3000/");
});


function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
			image 	CHAR(254) NOT NULL,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
		db.all(`select count(*) as count from phones`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}