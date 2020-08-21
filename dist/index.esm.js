import difference from 'lodash/fp/difference';
import groupBy from 'lodash/fp/groupBy';
import isArray from 'lodash/fp/isArray';
import isEqual from 'lodash/fp/isEqual';
import isFunction from 'lodash/fp/isFunction';
import isObject from 'lodash/fp/isObject';
import isString from 'lodash/fp/isString';
import keyBy from 'lodash/fp/keyBy';
import map from 'lodash/fp/map';
import values from 'lodash/fp/values';

var deepDiff = require('deep-diff');





















var updatedValues = {
  first: 1,
  second: 2,
  both: 3,
  bothWithDeepDiff: 4
};

var diff = function diff() {
  var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var second = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var idField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  // set defaults for "options"
  var opts = Object.assign({
    compareFunction: isEqual,
    // set default compareFunction to lodash isEqual
    updatedValues: updatedValues.second
  }, options); // parameter validation

  if (!isArray(first)) throw new Error('diff-arrays-of-objects error: "first" parameter must be an array but is not');
  if (!isArray(second)) throw new Error('diff-arrays-of-objects error: "second" parameter must be an array but is not');
  if (!isString(idField)) throw new Error('diff-arrays-of-objects error: "idField" parameter must be a string but is not');
  if (!isObject(options)) throw new Error('diff-arrays-of-objects error: "options" parameter must be an object but is not');
  if (values(updatedValues).indexOf(opts.updatedValues) === -1) throw new Error('diff-arrays-of-objects error: "options.updatedValues" must be a one of the ".updatedValues" but is not');
  if (!isFunction(opts.compareFunction)) throw new Error('diff-arrays-of-objects error: "options.compareFunction" must be a function but is not'); // arrays to hold the id values in the two arrays

  var firstIds = [];
  var secondIds = []; // index the first array by its id values.
  // if first is [{ id: 1, a: 1 }, { id: 2, a: 3 }] then
  // firstIndex will be { 1: { id: 1, a: 1 }, 2: { id: 2, a: 3 } }
  // "getKey" has a side-effect of pushing the id value into firstIds; this saves on another iteration through "first"

  var getKey = function getKey(o) {
    firstIds.push(o[idField]); // ! side-effect

    return o[idField];
  };

  var firstIndex = keyBy(getKey)(first); // "groupingFunction" is the function used in the groupBy in the next step.
  // It has a side-effect of pushing the idField value of second object (o2)
  // into the secondIds array. The side-effect can easily be avoided but it saves another iteration "second"

  var groupingFunction = function groupingFunction(o2) {
    secondIds.push(o2[idField]); // ! side-effect

    var o1 = firstIndex[o2[idField]]; // take advantage of the closure

    if (!o1) return 'added';else if (opts.compareFunction(o1, o2)) return 'same';else return 'updated';
  }; // this creates the "added", "same" and "updated" results


  var result = groupBy(groupingFunction)(second); // check what value should be returned for "updated" results
  // updatedValues.second is the default so doesn't have an "if" here

  if (opts.updatedValues === updatedValues.first) {
    result.updated = map(function (u) {
      return firstIndex[u[idField]];
    })(result.updated);
  } else if (opts.updatedValues === updatedValues.both) {
    result.updated = map(function (u) {
      return [firstIndex[u[idField]], u];
    })(result.updated);
  } else if (opts.updatedValues === updatedValues.bothWithDeepDiff) {
    result.updated = map(function (u) {
      var f = firstIndex[u[idField]];
      var s = u;
      var dd = deepDiff(f, s);
      return [f, s, dd];
    })(result.updated);
  } // now add "removed" and return


  var removedIds = difference(firstIds)(secondIds);
  var removed = map(function (id) {
    return firstIndex[id];
  })(removedIds);
  return Object.assign({
    same: [],
    added: [],
    updated: []
  }, result, {
    removed: removed
  });
};

diff.updatedValues = updatedValues;
var lib = diff;

export default lib;
