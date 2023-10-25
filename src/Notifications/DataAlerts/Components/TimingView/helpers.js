
export const getTimeOptionArray = (interval = 30) => {
  const optionsPerHour = 60 / interval
  const options = []
  const hours = 24
  const minuteFormatter = new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 0,
  })

  for (let hr = 0; hr < hours; hr++) {
    for (let min = 0; min < optionsPerHour; min++) {
      let ampm = 'am'
      if (hr >= 12) {
        ampm = 'pm'
      }

      let hour = hr % 12
      if (hour === 0) {
        hour = 12
      }

      const minute = minuteFormatter.format(min * interval)

      options.push({
        ampm,
        minute,
        hour,
        hour24: hr,
        value: `${hour}:${minute}${ampm}`,
        value24hr: `${hr}:${minute}`,
      })
    }
  }

  return options
}