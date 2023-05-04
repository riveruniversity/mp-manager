
export function groupBy(array: any[], key: string) {
  const participants: any[] = [];

  var outObject = array.reduce(function (a, e) {
    // GROUP BY estimated key (estKey), well, may be a just plain key
    // a -- Accumulator result object
    // e -- sequentially checked Element, the Element that is tested just at this iteration

    // new grouping name may be calculated, but must be based on real value of real field
    let estKey = (e[key]);

    (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
    return a;
  }, {});

  for (var key in outObject) {
    participants.push(outObject[key]);
  }

  return participants;
}