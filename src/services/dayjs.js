const DayJS = require('dayjs')
DayJS.extend(require('dayjs/plugin/customParseFormat'))
DayJS.extend(require('dayjs/plugin/utc'))
DayJS.extend(require('dayjs/plugin/timezone'))
DayJS.extend(require('dayjs/plugin/weekOfYear'))
module.exports = DayJS
