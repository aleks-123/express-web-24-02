console.log('test');

const cache = {
  ohrid: {
    localCache: {
      grad: 'testOhrid',
    },
    cacheTime: 239562395235,
  },
  skopje: {
    localCache: {
      grad: 'testSkopje',
    },
    cacheTime: 352366262662,
  },
};

// console.log(cache['skopje']);
// console.log(cache.skopje);
cache.ohrid.localCache = null;
cache.skopje.localCache['grad'] = 'prilep';

cache['bitola'] = {
  localCache: {
    bitolaTest: 'TESRTTTTT',
  },
  cacheTime: 12350123056312,
};

const ime = 'Aleksandar';

// cache = null;

console.log(cache);

// console.log(new Date());
// console.log(Date.now());
// console.log(new Date().getTime());
// console.log(new Date().getFullYear());
