var moment = require("moment");
const fs = require('fs');
var uuidv1 = require('uuid');

const last30Days = {
	from: function () { return moment().subtract('30', 'days').toDate().toString() },
	to: function () { return moment().add(5, 'day').startOf('day').toDate().toString() }
}

const last90Days = {
	from: function () { return moment().subtract('90', 'days').toDate().toString() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate().toString() }
}

const oneYear = {
	from: function () { return moment().subtract('1', 'years').toDate().toString() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate().toString() }
}

const yearToDate = {
	from: function () { return moment().startOf('year').toDate().toString() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate().toString() }
}

const fiveYearToDate = {
	from: function () { return moment().subtract('5', 'years').toDate().toString() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate().toString() }
}

const eachTest = [
	{
		creationTime: last90Days.from(),
		updateTime    : moment().subtract('15', 'days').toDate().toString()
	},
	{
		creationTime: oneYear.from(),
		updateTime    : moment().subtract('80', 'days').toDate().toString()
	},
	{
		creationTime: fiveYearToDate.from(),
		updateTime    : moment().subtract('1', 'years').add('1', 'day').toDate().toString()
	},
	{
		creationTime  : fiveYearToDate.from(),
		updateTime    : moment().startOf('year').add('1','day').toDate().toString()
	},
	{
		creationTime  : moment().subtract('8', 'years').startOf('year').toDate().toString(),
		updateTime    : moment().subtract('4', 'years').startOf('year').toDate().toString()
	},
	{
		creationTime  : moment().subtract('10', 'years').startOf('year').toDate().toString(),
		updateTime    : moment().subtract('6', 'years').startOf('year').toDate().toString()
	}
]

const deleteLokiDB = () => {
	let db = process.cwd()+'/janux-persistence-test.db';
		fs.unlink(db, function (err) {
			if (err) throw err;
			// if no error, file has been deleted successfully
			// console.log('db file deleted!');
		});  
}

const firstName = "John";
const middleName = "Doe";

const lastName = "Iglesias";
const maternal = "Smith";

const work = "work";

const organizationName1 = "Glarus";
const organizationName2 = "Glarus 2";

const name2 = "Jane";
const middleName2 = "Smith";

var invalidId1 = "313030303030303030303030";
var invalidId2 = "313030303030303030303032";
var functions = ["FUNCTION-1", "FUNCTION_2"];
var functions2 = ["FUNCTION_2", "FUNCTION_4"];

const makeMail = () => {
	return 'user' + uuidv1() + '@' + uuidv1() + '.com';
}

const M = 'M: ';
const L = 'L: ';

module.exports = {
	eachTest,
	last30Days,
	last90Days,
	oneYear,
	yearToDate,
	fiveYearToDate,
	deleteLokiDB,

	firstName,
	middleName,
	lastName,
	maternal,
	work,
	organizationName1,
	organizationName2,
	name2,
	middleName2,
	invalidId1,
	invalidId2,
	functions,
	functions2,
	makeMail,
	M,L
}