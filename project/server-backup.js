const express = require("express");
const app = express();


const sqlite = require("sqlite3").verbose();
let db = my_database('./phones.db');

const bodyParser = require("body-parser");
app.use(bodyParser.json());



app.get("/phones", async function(req, res) {
	const phones = await db.getAllPhones();
	return res.status(200).json({ phones });
});


app.post("/phones", async function(req, res) {
	const results = await db.createPhone(req.body);
	return res.status(201).json({ id: results[0] })
})


app.put("/phones/:id", async function(req,res) {
	const id = await db.updatePhone(req.params.id, req.body);
	return res.status(200).json({ id });
});


app.delete("/phones/:id", async function(req, res) {
	const id = await db.deletePhone(req.params.id);
	return res.status(200).json({ id });
})


app.get("/test", function(req, res) {
    return res.status(200).json({ success: true});
});

app.listen(3000, function() {
    console.log("Web server up and running");
});


function getAllPhones() {

}

function createPhone(phone) {

}

function updatePhone(id, phone) {

}

function deletePhone(id) {
	
}


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
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
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