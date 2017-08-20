/**
 * Created by NCS-KSW on 2017-08-08.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const configDB = require('../../configDB');
var pool = mysql.createPool(configDB);
var toolBox = require('../../models/toolBox');

/* POST users listing. */
router.post('/', function(req, res, next) {
    pool.getConnection(function (err, connexion) {
        if (err)
            throw err;
        connexion.query("SELECT * FROM users WHERE organization = '" + req.body.organization + "' name = '" + req.body.name + "' email = '" + req.body.email + "'", function (err, rows) {
            if (err)
                throw err;
            if(rows.length > 0){
                var user = rows[0]
                if(req.body.password == undefined) {
                    res.json({
                        type: false,
                        data: "Invalid input"
                    });
                    return;
                }
                connexion.query("UPDATE users SET password = '" + req.body.password + "' WHERE email = '" + req.body.email + "'", function (err1, result) {
                    if(err1) throw err1
                    if(result.affectedRows > 0){
                        res.json({
                            type: true,
                            data: user.email
                        })
                    } else {
                        res.json({
                            type: false,
                            data: 'DB error'
                        })
                    }
                })
            } else {
                res.json({
                    type: false,
                    data: "Incorrect personal information"
                });
            }

            connexion.release();
        });
    })
});

module.exports = router;