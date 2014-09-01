gulp = require('gulp')
gutil = require 'gulp-util'
changed = require('gulp-changed')
cache = require('gulp-cached')
plumber = require('gulp-plumber')
clean = require('gulp-clean')
rename = require("gulp-rename")
coffee = require ('gulp-coffee')
mocha = require('gulp-mocha')
runSequence = require('run-sequence')

task = gulp.task.bind(gulp)
watch = gulp.watch.bind(gulp)
src = gulp.src.bind(gulp)
dest = gulp.dest.bind(gulp)
from = (source, options={dest:folders_dest, cache:'cache'}) ->
  options.dest ?= folders_dest
  options.cache ?= 'cache'
  src(source).pipe(changed(options.dest)).pipe(cache(options.cache)).pipe(plumber())
GulpStream = src('').constructor
GulpStream::to = (dst) -> @pipe(dest(dst))#.pipe(livereload(tinylrServer))
GulpStream::pipelog = (obj, log=gutil.log) -> @pipe(obj).on('error', log)

folders_src = 'src/'
folders_coffee = folders_src
folders_dest = './'

FromStream = from('').constructor
FromStream::to = (dst) -> @pipe(dest(dst))#.pipe(livereload(tinylrServer))
FromStream::pipelog = (obj, log=gutil.log) -> @pipe(obj).on('error', log)

rootOf = (path) -> path.slice(0, path.indexOf(''))
midOf = (path) -> path.slice(path.indexOf('')+1, path.indexOf('*'))

distributing = false

# below will put output js files in wrong directory structure!!!
# coffee: [coffeeroot+'*.coffee', coffeeroot+'samples/**/*.coffee', coffeeroot+'test/**/*.coffee']
# use the code below to solve this problem
patterns = (args...) ->
  for arg in args
    if typeof arg =='string' then pattern(arg)
    else arg
gulpto = (destbase, args...) ->
  for arg in args
    if typeof arg =='string' then pattern(arg, destbase)
    else arg
pattern = (src, destbase, options) -> new Pattern(src, destbase, options)
class Pattern
  constructor: (@src, @destbase, options={}) ->
    if typeof destbase=='object' then options = destbase; @destbase = undefined
    srcRoot = rootOf(@src)
    if not @destbase then @destbase = rootOf(@src)
    if not options.desttail? then @desttail = midOf(@src)
    if @desttail then @dest = @destbase+@desttail
    else @dest = @destbase

cleanFolders = for p in 'lib bin test samples-js taiji-libraries-js bootstrap-js'.split(' ') then folders_dest+p
task 'clean', -> src(cleanFolders, {read:false}).pipe(clean())

files_copy = (folders_src+name for name in ['**/*.js', '**/*.json', '**/*.html', '**/*.css'])
task 'copy', -> from(files_copy, {cache:'copy'}).to(folders_dest)

files_coffee = [folders_coffee+'**/*.coffee']
task 'coffee', -> from(files_coffee, {cache:'coffee'}).pipelog(coffee({bare: true})).to(folders_dest)
task 'rename', -> from(folders_dest+'bin/*.js').pipe(rename((path) -> path.extname = "")).to(folders_dest+'bin')

task 'make', (callback) -> distributing = false; runSequence('clean', ['copy', 'coffee'], 'rename', callback)

files_mocha = folders_dest+'test/**/*.js'

onErrorContinue = (err) -> console.log(err.stack); @emit 'end'
task 'mocha', ->  src(files_mocha).pipe(mocha({reporter: 'spec'})).on("error", onErrorContinue)
task 'test', (callback) -> runSequence('make', 'mocha', callback)
task 'default',['test']