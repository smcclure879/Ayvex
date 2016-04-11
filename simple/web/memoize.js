/*
* memoize.js
* by @philogb and @addyosmani
* with further optimizations by @mathias
* and @DmitryBaranovsk
* and smcclure879
* perf tests: http://bit.ly/q3zpG3
* Released under an MIT license.
*/
function memoize( fn ) {
	if (fn==null || typeof fn === 'undefined') 
	{
		alert('bad fn to memoize');
	}
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length;
			
        currentArg = null;
		fn.memoize || (fn.memoize = {});
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ?
							JSON.stringify(currentArg) :
							currentArg;
        }
        return (hash in fn.memoize) ? 
					fn.memoize[hash] :
					fn.memoize[hash] = fn.apply(this, args);
    };
}