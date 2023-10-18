import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

const timezoneAdjust = (timestamp, timezone='UTC') => {
  const userTZ = dayjs.tz.guess();
  const dataTime = dayjs(timestamp).utc();
  const localtime = dataTime.tz(timezone);
  const usertime = dataTime.tz(userTZ);
  const diff = (usertime.utcOffset() - localtime.utcOffset() )
  return dayjs.utc(timestamp).subtract(diff, 'minutes').format();
}

export default timezoneAdjust;