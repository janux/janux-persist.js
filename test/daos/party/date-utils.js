var moment = require("moment");

const last30Days = {
	from: function () { return moment().subtract('30', 'days').toDate() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate() }
}

const last90Days = {
	from: function () { return moment().subtract('90', 'days').toDate() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate() }
}

const oneYear = {
	from: function () { return moment().subtract('1', 'years').toDate() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate() }
}

const yearToDate = {
	from: function () { return moment().startOf('year').toDate() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate() }
}

const fiveYearToDate = {
	from: function () { return moment().subtract('5', 'years').startOf('year').toDate() },
	to: function () { return moment().add(1, 'day').startOf('day').toDate() }
}

const eachTest = [
	{
		creationTime: last90Days.from(),
		updateTime    : moment().subtract('15', 'days').toDate()
	},
	{
		creationTime: oneYear.from(),
		updateTime    : moment().subtract('80', 'days').toDate()
	},
	{
		creationTime: fiveYearToDate.from(),
		updateTime    : moment().subtract('1', 'years').add('1', 'day').toDate()
	},
	{
		creationTime  : fiveYearToDate.from(),
		updateTime    : moment().startOf('year').add('1','day').toDate()
	},
	{
		creationTime  : moment().subtract('7', 'years').startOf('year').toDate(),
		updateTime    : moment().subtract('4', 'years').startOf('year').toDate()
	},
	{
		creationTime  : moment().subtract('7', 'years').startOf('year').toDate(),
		updateTime    : moment().subtract('6', 'years').startOf('year').toDate()
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