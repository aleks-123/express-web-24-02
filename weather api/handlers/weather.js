//! npm install node-fetch
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

let cache = {};
const getCity = async (req, res) => {
  const key = '2cf6f21794e165121aab02c23946cc7e';
  // app.get('/api/v1/weather/:city');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${req.params.city}&appid=${key}`;

  // cache = {
  //   ohrid: {
  //     localCache: {
  //       grad: 'Ohrid',
  //       temperatura: '22stepeni',
  //     },
  //     cacheTime: 2352352352345,
  //   },
  //   skopje: {
  //     localCache: {},
  //     cacheTime: 235235623562,
  //   },
  //   tetovo: {
  //     localCache: { asdfgasdgasdgasdgasdg },
  //     cacheTime: 346234624362,
  //   },
  // };

  //! Prvo proveruuvame dali e zastarena datata, i ako e zastera soodvbetno ja brishime
  if (
    cache[req.params.city] &&
    cache[req.params.city].cacheTime !== null &&
    cache[req.params.city].cacheTime + 60 * 1000 < new Date().getTime()
  ) {
    cache[req.params.city].localCache = null;
  }

  //! Ovoj uslov se uklucuva samo ako go nemame gradot vo nashiot kash ili informacaijata zastira vo zavisnost od prviot uslov
  if (!cache[req.params.city] || cache[req.params.city].localCache === null) {
    const data = await fetch(url);
    cache[req.params.city] = {
      localCache: await data.json(),
      cacheTime: Date.now(),
    };
  }

  res.send(cache);

  // const data = await fetch(url);
  // const weatherData = await data.json();
};

module.exports = {
  getCity,
};

// 2cf6f21794e165121aab02c23946cc7e
// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// app.get('/api/v1/weather/:city');
