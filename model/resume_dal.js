/**
 * Created by student on 11/16/16.
 */
var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM account_id_view;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.getById = function(resume_id, callback) {
    var query = 'SELECT * FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];
    console.log(query);

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

exports.insert = function(params, callback) {
    var query = 'INSERT INTO resume (account_id, resume_name) VALUES (?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var queryData = [params.account_id, params.resume_name];

    connection.query(query, params.resume_name, function(err, result) {

        // THEN USE THE RESUME_ID RETURNED AS insertId AND THE SELECTED SCHOOL_IDs INTO RESUME_SCHOOLS
        var resume_id = result.insertId;

        // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
        var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES (?)';

        // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
        var resumeSchoolData = [];
        for (var i = 0; i < params.school_id.length; i++) {
            resumeSchoolData.push([resume_id, params.school_id[i]]);
        }

        // NOTE THE EXTRA [] AROUND resumeSchoolData
        connection.query(query, [resumeSchoolData], function (err, result) {
            callback(err, result);

        });
    });
};

exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

//declare the function so it can be used locally
var resumeSchoolInsert = function(resume_id, schoolIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSchoolData = [];
    for(var i=0; i < schoolIdArray.length; i++) {
        resumeSchoolData.push([resume_id, schoolIdArray[i]]);
    }
    connection.query(query, [resumeSchoolData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSchoolInsert = resumeSchoolInsert;

//declare the function so it can be used locally
var resumeSchoolDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM resume_school WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSchoolDeleteAll = resumeSchoolDeleteAll;

exports.update = function(params, callback) {
    var query = 'UPDATE resume SET resume_name = ? WHERE resume_id = ?';

    var queryData = [params.resume_name, params.resume_id];

    connection.query(query, queryData, function(err, result) {
        //delete resume_school entries for this resume
        resumeSchoolDeleteAll(params.resume_id, function(err, result){

            if(params.school_id != null) {
                //insert resume_school ids
                resumeSchoolInsert(params.resume_id, params.school_id, function(err, result){
                    callback(err, result);
                });}
            else {
                callback(err, result);
            }
        });

    });
};

    /*  Stored procedure used in this example
     DROP PROCEDURE IF EXISTS company_getinfo;
     DELIMITER //
     CREATE PROCEDURE company_getinfo (_company_id int)
     BEGIN
     SELECT * FROM company WHERE company_id = _company_id;
     SELECT a.*, s.company_id FROM address a
     LEFT JOIN company_address s on s.address_id = a.address_id AND company_id = _company_id
     ORDER BY a.street, a.zipcode;
     END //
     DELIMITER ;
     # Call the Stored Procedure
     CALL company_getinfo (4);
     */

exports.edit = function(resume_id, callback) {
    var query = 'CALL resume_getinfo(?)';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};