var util = require('util')
var minimatch = require('minimatch')
var _ = require('lodash')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var spawn = require('child_process').spawn

/**
 * :runner: Run multiple package.json scripts with one command.
 * @module pkgrun
 * @package.keywords npm, package, script, run, glob, all
 * @package.bin.pkgrun ./bin/package-run.js
 * @param  {Array|String} globPattern$   Script(s) glob pattern(s).
 * @param  {Boolean} nonstop             Run through reguardless if exit code.
 * @param  {Boolean} forgiving           Run through reguardless if a pattern is unmatched.
 */

function packageRun (globPattern$, nonstop, forgiving) {
  var globPatterns = _.flatten([globPattern$])
  return fs.readFileAsync('./package.json').then(JSON.parse)
  .then(function (pkg) {
    return packageRun.globMatches(globPatterns, pkg)
  })
  .then(function (globMatches) {

    // run through non matches and exit the script early if not forgiving
    if (!forgiving) {
      _.each(globMatches, function (globMatch) {
        if (!_.size(globMatch.matches)) {
          var msg = util.format('No package script match found: %s \n', globMatch.pattern)
          process.stdout.write(msg)
          return process.exit(1)
        }
      })
    }

    // gather all the scripts from matches
    var scripts = _.chain(globMatches)
    .pluck('matches')
    .thru(function (scripts) {
      return _.extend.apply(null, scripts)
    })
    .value()

    // run through all the scripts
    var codes = []
    return Promise.each(_.keys(scripts), function (key) {
      if (!nonstop && _.contains(codes, 1)) return false
      return packageRun.runNpmCmd(['run', key])
      .then(function (code) {
        codes.push(code)
      })
    }).then(function () {
      if (_.contains(codes, 1)) return process.exit(1)
      return process.exit(0)
    })
  })
}

packageRun.globMatches = function (globPatterns, pkg) {
  return _.chain(globPatterns)
  .map(function (globPattern) {
    var matches = _.chain(pkg.scripts)
    .pairs()
    .filter(function (vals) {
      var name = vals[0]
      return minimatch(name, globPattern)
    })
    .object()
    .value()
    return {
      'pattern': globPattern,
      'matches': matches
    }
  })
  .value()
}

packageRun.runNpmCmd = function (args) {
  return new Promise(function (resolve, reject) {
    args = (Array.isArray(args)) ? args : args.split(' ')

    process.env.NPM_CONFIG_COLOR = 'always'
    var npmCmd = spawn('npm', args)

    npmCmd.stdout.on('data', function (data) {
      data = data.toString('utf8')
      process.stdout.write(data)
    })

    npmCmd.stderr.on('data', function (data) {
      data = data.toString('utf8')
      process.stdout.write(data)
    })

    npmCmd.on('close', function (code) {
      return resolve(code)
    })
  })
}

// packageRun.cleanOutput = function (output) {
//   output = _.chain([output])
//   .flatten()
//   .without(' \n')
//   .map(function (item) {
//     var replace = '\u001b[0m \n'
//     if (item === replace) return '\u001b[0m'
//     return item
//   })
//   .value()
//   var last = output.pop()
//   last = last.replace(/\n$/, '')
//   output.push(last)
//   return output.join('')
// }

module.exports = packageRun
