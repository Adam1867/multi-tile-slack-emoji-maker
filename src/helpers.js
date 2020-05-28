/**
 * Get a scaled down clone of an image.
 *
 * @param  {Jimp}    image  the image file
 * @param  {number}  max    max height/width of the image
 * @return {Jimp}           scaled image
 */
function scaleImage(image, max) {
  const height = image.getHeight()
  const width = image.getWidth()
  const biggestDimension = Math.max(height, width)

  if (max && biggestDimension > max) {
    return image.clone().scaleToFit(max, max)
  }
  return image.clone()
}

/**
 * Get the maximum dimensions of an image that would be compatible as a slack
 * emoji.
 *
 * @param  {Jimp}     image              the image file
 * @param  {object}   opts               object of options
 * @param  {number}   opts.tileSize      size in pixels of a slack emoji tile
 * @return {object}                      object containing the dimensions
 */
function getDimensions(image, opts) {
  const defaults = {
    tileSize: 128
  }
  const options = { ...defaults, ...opts }

  const height = image.getHeight()
  const width = image.getWidth()

  if (height < options.tileSize || width < options.tileSize) {
    return null
  }

  const maxHeight = height - (height % options.tileSize)
  const maxWidth = width - (width % options.tileSize)

  return {
    // columns: maxWidth / options.tileSize,
    height: maxHeight,
    // rows: maxHeight / options.tileSize,
    // tile: options.tileSize,
    width: maxWidth
  }
}

/**
 * Get the base image that will be divided into emoji image tiles.
 *
 * @param  {Jimp}     image              the image file
 * @param  {object}   dimensions         object of dimensions
 * @param  {object}   opts               object of options
 * @param  {boolean}  opts.square        should emoji be square
 * @return {Jimp}                        base image for tiling
 */
function getBaseImage(image, dimensions, opts) {
  const defaults = {
    square: true
  }
  const options = { ...defaults, ...opts }

  const { height, width } = dimensions

  // get base image
  let baseImage
  if (options.square) {
    const smallestDimension = Math.min(height, width)
    baseImage = image.clone().cover(smallestDimension, smallestDimension)
  } else {
    baseImage = image.clone().cover(width, height)
  }

  return baseImage
}

/**
 * Returns the maxiumum size this emoji could be tiled into
 * TODO: Accept rectangular images
 *
 * @param  {Jimp}    image       - the image file to tile
 * @param  {number}  tileSize    - the individual tile size
 * @return {void}
 */
function getMaxSize(image, tileSize) {
  const height = image.getHeight()
  const width = image.getWidth()
  if (height !== width) throw new Error('This image is not a square.')
  const maxDimension = width / tileSize
  if (maxDimension % 1) throw new Error('This image is not tileable')
  return maxDimension
}

/**
 * Returns multidimensional array of Jimp images for the emoji
 *
 * @param  {Jimp}    image       - the image file to tile
 * @param  {number}  tileSize    - the individual tile size
 * @return {[[Jimp]]}
 */
function createTiles(image, tileSize) {
  try {
    const tiles = []
    const columnCount = image.getWidth() / tileSize
    const rowCount = image.getHeight() / tileSize

    for (let i = 0; i < rowCount; i++) {
      const row = []
      for (let j = 0; j < columnCount; j++) {
        row.push(
          image.clone().crop(j * tileSize, i * tileSize, tileSize, tileSize)
        )
      }
      tiles.push(row)
    }

    return tiles
  } catch (error) {
    throw new Error(
      'Something went wrong. Perhaps an invalid image provided to createTiles()?'
    )
  }
}

module.exports = {
  createTiles,
  getBaseImage,
  getDimensions,
  getMaxSize,
  scaleImage
}
