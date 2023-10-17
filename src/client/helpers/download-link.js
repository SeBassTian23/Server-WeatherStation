import dayjs from 'dayjs';

/* Download link for a selected date/range */
const downloadLink = (period="day",selectedDate=new Date(), units='metric') => {
  
  let link = '/download/'
  if(period === 'now')
    link += 'latest'
  if(period === 'day')
    link += dayjs(selectedDate).format('YYYY-MM-DD');
  if(period === 'month')
    link += dayjs(selectedDate).format('YYYY-MM');
  if(period === 'year')
    link += dayjs(selectedDate).format('YYYY');
  if(period === 'range')
    link += `${dayjs(selectedDate[0]).format('YYYY-MM-DD')},${dayjs(selectedDate[1]).format('YYYY-MM-DD')}`
  
  return link + `${units !=='metric'? `?units=${units}`: '' }`;
}

export default downloadLink;