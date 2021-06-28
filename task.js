// in worker.js
self.addEventListener('message', function(e) {



  //  now send back the results
  self.postMessage('done');
}, false);