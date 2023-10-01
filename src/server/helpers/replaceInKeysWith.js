function replaceInKeysWith(obj, from, to) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const regex = new RegExp(from, 'g')
      const newKey = key.replace(regex, to);
      result[newKey] = obj[key];
    }
  }
  return result;
}

module.exports = replaceInKeysWith