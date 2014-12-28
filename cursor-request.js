var _ = require('lodash');

module.exports = function cursorRequest(
  params,
  fetch,
  getItemsFromResponse,
  getNextCursorFromResponse,
  setCursorToRequest) {

  var chunks = [];

  function loop(params) {
    return fetch(params)
      .then(function(response) {
        var nextCursor = getNextCursorFromResponse(response);
        var itemsChunk = getItemsFromResponse(response);
        chunks.push(itemsChunk);
        if (!nextCursor || nextCursor === '0') {
          return _.flatten(chunks, true);
        } else {
          var newParams = setCursorToRequest(params, nextCursor);
          return loop(newParams);
        }
      })
  }

  return loop(params);
}


