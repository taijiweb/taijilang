fs = require 'fs'
path = require 'path'

# If obj.hasOwnProperty has been overridden, then calling obj.hasOwnProperty(prop) will break.
# See: https:# github.com/joyent/node/issues/1707
hasOwnProperty = (obj, prop) -> Object.prototype.hasOwnProperty.call(obj, prop)

module.exports = exports = TaijiModule = (filePath, @parent) ->
  @exports = {} # meta exports for the module
  if not filePath
    if @parent then @filePath = @parent.filePath
    else @filePath = __filename
  else if not @parent then @filePath = filePath
  else @filePath = @parent.findPath(filePath)
  @basePath = path.dirname(@filePath)
  if @parent
    @modulePaths = @parent.modulePaths.slice()
    @modulePaths.unshift path.resolve(@basePath, '../taiji-libraries')
  else
    @modulePaths = modulePaths.slice()
    @modulePaths.unshift path.resolve(@basePath, '../taiji_modules')
  return this

modulePaths = []

TaijiModule._initPaths = ->
  if process.env['TAIJILANG_PATH']
    splitter = if process.platform == 'win32' then ';' else ':'
    paths = process.env['TAIJILANG_PATH'].split(splitter)
    for path1, i in paths then paths[i] = path.resolve(path1, 'taiji-libraries')
  modulePaths = paths

TaijiModule._initPaths()

# In order to minimize unnecessary lstat() calls, this cache is a list of known-real paths. Set to an empty object to reset.
_realpathCache = {}

# check if the file exists and is not a directory
tryFile = (requestPath) ->
  try
    stats = fs.statSync(requestPath)
    if stats && !stats.isDirectory() then fs.realpathSync(requestPath, _realpathCache)
  catch ex then return false

tryPath = (filePath, trailingSlash) ->
  if !trailingSlash
    filename = tryFile(filePath)
    if !filename && filePath.slice(-3)!='.tj'
      filename = tryFile(filePath + '.tj')
  if !filename
    mainPath = path.resolve(filePath, 'main.tj')
    filename = tryFile(mainPath)
  filename

TaijiModule.matchPaths = (request, paths) ->
  trailingSlash = request.slice(-1) == '/'
  for path1 in paths
    if filename = tryPath path.resolve(path1, request), trailingSlash then return filename

TaijiModule::findPath = (filePath) ->
  if filePath=='**evaluated taijilang code**' then return filePath
  if fs.exists(filePath) then return filePath
  start = filePath.substring(0, 2)
  if start=='./' or start=='.\\' or start=='..'
    trailingSlash = filePath.slice(-1) == '/'
    filename = tryPath(path.resolve(@basePath, filePath), trailingSlash)
  else
    if filePath.charAt(0) == '/' then paths = [''] # absolute path, no other paths is searched
    else paths = @modulePaths
    filename = TaijiModule.matchPaths(filePath, paths)
  if !filename
    err = new Error("Cannot find module '" + filePath + "'")
    err.code = 'MODULE_NOT_FOUND'
    throw err
  return filename