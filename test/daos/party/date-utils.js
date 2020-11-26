var moment = require("moment");

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
		creationTime  : moment().subtract('7', 'years').startOf('year').toDate().toString(),
		updateTime    : moment().subtract('4', 'years').startOf('year').toDate().toString()
	},
	{
		creationTime  : moment().subtract('7', 'years').startOf('year').toDate().toString(),
		updateTime    : moment().subtract('6', 'years').startOf('year').toDate().toString()
	}
]
module.exports = {
	eachTest,
	last30Days,
	last90Days,
	oneYear,
	yearToDate,
	fiveYearToDate
}