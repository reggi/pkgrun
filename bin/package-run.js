#!/usr/bin/env node
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2))
var packageRun = require('../package-run')
var pkg = require('../package.json')
var binDoc = require('../bin-doc')

var doc = {
  'name': pkg.name,
  'desc': pkg.description,
  'usage': {
    '[script ...]': 'Script(s) glob pattern(s).',
    '--help | -h': 'Shows this help message.',
    '--version | -v': 'Show package version.'
  },
  'options': {
    'nonstop': 'Run through reguardless if exit code.',
    'forgiving': 'Run through reguardless if a pattern is unmatched'
  },
  'optionAliases': {
    'nonstop': 'n',
    'forgiving': 'f'
  }
}

if (argv.v || argv.version) {

  console.log(pkg.version)

} else if (argv._.length) {

  var nonstop = argv.nonstop || argv.n || false
  var forgiving = argv.forgiving || argv.f || false
  packageRun(argv._, nonstop, forgiving)

} else {

  console.log(binDoc(doc))

}
