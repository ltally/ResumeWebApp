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
    var query = 'SELECT r.*, a.first_name, a.last_name, a.email FROM resume r ' +
    'JOIN account a on a.account_id = r.user_account_id ' +
    'WHERE r.resume_id = ?';
    var queryData = [resume_id];
    //console.log(query);

    connection.query(query, queryData, function(err, resume) {
        resumeSkillViewById (resume_id, function (err, resume_skill) {
            resumeCompanyViewById (resume_id, function (err, resume_company) {
                resumeSchoolViewById (resume_id, function (err, resume_school) {
                    callback(err, resume, resume_skill, resume_company, resume_school);
                });
            });
        });
    });
};

//VIEW BY IDS!!!!!!!!!!!!!!!!!!!!!

var resumeSkillViewById = function(resume_id, callback){
    var query = 'SELECT * FROM resumeSkill_viewById WHERE resume_id = ?';
    connection.query(query, resume_id, function (err, result) {
        callback(err, result);
    });
};
module.exports.resumeSkillViewById = resumeSkillViewById;

var resumeCompanyViewById = function(resume_id, callback){
    var query = 'SELECT * FROM resumeCompany_viewById WHERE resume_id = ?';
    connection.query(query, resume_id, function (err, result) {
        callback(err, result);
    });
};
module.exports.resumeCompanyViewById = resumeCompanyViewById;

var resumeSchoolViewById = function(resume_id, callback){
    var query = 'SELECT * FROM resumeSchool_viewById WHERE resume_id = ?';
    connection.query(query, resume_id, function (err, result) {
        callback(err, result);
    });
};
module.exports.resumeSchoolViewById = resumeSchoolViewById;

//INSERTS!!!!!!!!!!!!!!!!!!!!!

exports.insert = function(params, callback) {
    var query = 'INSERT INTO resume (account_id, resume_name) VALUES (?,?)';

    // the question marks in the sql query above will be replaced by the values of the
    // the data in queryData
    var resumeData = [params.account_id, params.resume_name];

    connection.query(query, resumeData, function(err, result) {

        // THEN USE THE RESUME_ID RETURNED AS insertId AND THE SELECTED SCHOOL_IDs INTO RESUME_SCHOOLS
        var resume_id = result.insertId;

        resumeSkillInsert(resume_id, params.skill_id, function(err, result) {
        });
        resumeCompanyInsert(resume_id, params.company_id, function(err, result) {
        });
        console.log("SCHOOL ID : "+ params.school_id);
        console.log("SCHOOL ID LENGTH: "+ params.school_id.length);
        resumeSchoolInsert(resume_id, params.school_id, function(err, result) {
            callback(err, result);
        });
    });
};

var resumeSchoolInsert = function(resume_id, schoolIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSchoolData = [];
    for(var i=0; i < schoolIdArray.length; i++) {
        resumeSchoolData.push([resume_id, schoolIdArray[i]]);
    }
    connection.query(query, [resumeSchoolData], function(err, result){
        console.log("INSERTING SCHOOLS");
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSchoolInsert = resumeSchoolInsert;

var resumeCompanyInsert = function(resume_id, companyIdArray, callback) {
    console.log("companyIDArray: " + companyIdArray);
    var query = 'INSERT into resume_company (company_id, resume_id) VALUES ?';

    var resumeCompanyData = [];
    for (var c = 0; c < companyIdArray.length; c++) {
        resumeCompanyData.push([companyIdArray[c], resume_id]);
    }
    connection.query(query, [resumeCompanyData], function(err, result) {
        console.log("GETTING HERE COMPANY INSERT FOR RESUME ");
        console.log(err);
        callback(err, result);
    });
};
module.exports.resumeCompanyInsert = resumeCompanyInsert;

//declare the function so it can be used locally
var resumeSkillInsert = function(resume_id, skillIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    console.log("skills to be inserted: " + skillIdArray.length);
    var query = 'INSERT INTO resume_skill (skill_id, resume_id) VALUES ?';
    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSkillData = [];
    for(var i=0; i < skillIdArray.length; i++) {
        resumeSkillData.push([skillIdArray[i], resume_id]);
    }
    connection.query(query, [resumeSkillData], function (err, result) {
        console.log("INSERTING");
        console.log(err);
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSkillInsert = resumeSkillInsert;

////////////////////////////////DELETES///////////////////////////////////////

exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};

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

var resumeSkillDeleteAll = function (resume_id, callback) {

    var query = 'DELETE FROM resume_skill WHERE resume_id = ?';
    var queryData = [resume_id];
    connection.query(query, queryData, function(err, result) {
        console.log("DELETING");
        callback(err, result);
    });
};
module.exports.resumeSkillDeleteAll = resumeSkillDeleteAll;

var resumeCompanyDeleteAll = function (resume_id, callback) {
    var query = 'DELETE FROM resume_company WHERE resume_id = ?';
    var queryData = [resume_id];
    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
module.exports.resumeCompanyDeleteAll = resumeCompanyDeleteAll;


//////////////////////////////UPDATE FUNCTION(S)://////////////////////////////

exports.update = function(params, callback) {
    var query = 'UPDATE resume SET resume_name = ?, user_account_id = ? WHERE resume_id = ?';
    var queryData = [params.resume_name, params.user_account_id, params.resume_id];
    connection.query(query, queryData, function(err, result) {
        resumeSkillDeleteAll(params.resume_id, function(err, result) {
            if (params.skill_id != null) {
                console.log("Params skill id: " + params.skill_id);
                resumeSkillInsert(params.resume_skill, params.skill_id, function (err, result) {
                    callback(err,result);
                });
            } else {
                console.log("skill_id array is null");
                callback(err, result);
            }
        });
    });
};

/*exports.update = function(params, callback) {
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
};*/

var updateResumeSkill = function(resume_id, skillIdArray, callback) {
    var query = 'UPDATE resume_skill SET skill_id = ? WHERE resume_id = ?';

    var skillData = [];
    for (var i = 0; i < skillIdArray.length; i++) {
        skillData.push([skillIdArray[i], resume_id]);
    }
    connection.query(query, skillData, function(err, result) {
        callback(err, result);
    });
};
module.exports.updateResumeSkill = updateResumeSkill;

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

//EDITS!!!!!!!!!!!!

/*exports.edit = function(resume_id, callback) {
    var query = 'CALL resume_getinfo(?)';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};*/