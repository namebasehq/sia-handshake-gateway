const cache = {};

function getKey(key) {
  if (key in cache) {
    return cache[key];
  }

  return null;
}

function setKey(key, value) {
  cache[key] = value;
}

module.exports = { getKey, setKey };
