'use strict'
// sqliteAsync.js
// ========
const print= function(x){	process.stdout.write(""+x+"\n");    /*log to a file here?   sqa requires this*/    };
const proj = function(obj,arrPropNames){
    //bugbugconsole.log(arrPropNames);
    return arrPropNames.map( function(x) {
	if (typeof obj[x] == 'undefined')
	    throw('missing '+x+' bugbug-err0024m-undefined-'+x+JSON.stringify(obj)+'\n'+arrPropNames.join(".."));
	return obj[x];
    });
};
      
module.exports = {
    
    //turn obj to array with column order specified
    proj: proj,

    promote: function(db) {
	//it gains all these functions below...


	//single row expected
	db.getAsync=function (sql,vals) {
	    return new Promise(function (resolve, reject) {
		db.get(sql, vals, function (err, row) {
		    if (err)
			reject(err);
		    else
			resolve(row);
		});
	    });
	};

	//single VALUE expected
	db.getScalarAsync=async function (sql,vals,index) {
	    var row = await db.getAsync(sql,vals);
	    console.log("bugbug0128row="+JSON.stringify(row));
	    return row[index];
	}
	
	//dataset expected
	db.allAsync=function (sql,vals) {
	    return new Promise(function (resolve, reject) {
		db.all(sql, vals, function (err, rows) {
		    if (err)
			reject(err);
		    else
			resolve(rows);
		});
	    });
	};

	
	//no return value expected
	db.runAsync=function (sql,vals) {    
	    return new Promise(function (resolve, reject) {
		console.log("running:"+sql);
		db.run(sql, vals, function(err,rows) {
		    if (err) {
			//if (verbose)
			print("bugbug1852s:"+sql+'\n'+err);
			reject(err);
		    } else {
			resolve();
		    }
		});
	    })
	};


	db.domainAsync = async function (sql,vals,lookupBy) {
	    let rows = await db.allAsync(sql,vals);
	    let retval = {};
	    for(let row of rows) {
		let key = row[lookupBy];
		retval[key]=row;		
	    }
	    return retval;
	};

	
	db.insertJson = async function(tbl,colSql,obj) {
	    let cols = colSql.split(",");
	    let placeholders = cols.map( (_)=>"?" ).join(",");
	    let vals = proj(obj,cols);
	    let sql = `insert into ${tbl} (${colSql})\nvalues (${placeholders});\n`;
	    print(sql);
	    return await db.runAsync(sql,vals);
	};
	    

	db.forceTable = async function (tbl,cols){
	    let colSql=cols.join(',\n');
	    let sql = `    create table if not exists   ${tbl} (\n ${colSql} );    `;
	    // assume we don't need to do this every every time??
	    //  pragma foreign_keys=ON;  --bugbug does this apply forever to the db or just this session of sqlite???


	    print(sql);
	    return db.runAsync(sql);
	}

	
    }
}

//var sqlite = require('sqlite3').verbose();

