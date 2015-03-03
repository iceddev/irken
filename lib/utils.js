/*
  Subset of mkdirp that does not rely on ENOENT
  Can't be "use strict" because Octal literals are not allowed in strict mode.
 */

/*eslint no-octal:0, strict: 0*/

var fs = require('fs');
var path = require('path');

function mkdirp(p, opts, f, made){
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    var mode = opts.mode;

    // if (mode === undefined) {
    //     mode = 777 & (~process.umask());
    // }
    if (!made) {
      made = null;
    }

    var cb = f || function () {};
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }

        fs.stat(p, function (er2, stat) {
            // if the stat fails, then that's super weird.
            // let the original error be the failure reason.
            if (er2 || !stat.isDirectory()) {
              return cb(er, made);
            }

            cb(null, made);
        });
    });
}

module.exports = {
  mkdirp: mkdirp
};
