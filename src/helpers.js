/**
 * Gets the maximum image dimensions that would work as a slack emoji
 *
 * @param  {Jimp}    image               a Jimp image file
 * @param {object}   options
 * @param {number}   options.tileSize    size in pixels of a slack emoji tile
 * @param {boolean}  options.rectangular whether to allow portrait and landscape images to remain rectangular
 * @return {object}                      object containing the max emoji height and width
 */
function getDimensions(image, options) {
  const defaultOptions = {
    ratioThreshold: 0.1, // testing - prevent images too cropped
    rectangular: false,
    tileSize: 128
  }
  const opts = { ...defaultOptions, ...options }

  const h = image.getHeight()
  const w = image.getWidth()
  const height = h - (h % opts.tileSize)
  const width = w - (w % opts.tileSize)
  const withinThreshold = h / w - height / width <= opts.ratioThreshold

  if (opts.rectangular && withinThreshold)
    return {
      columns: height / opts.tileSize,
      height,
      rows: width / opts.tileSize,
      tile: opts.tileSize,
      width
    }

  const dimensions = Math.min(height, width)
  return {
    columns: dimensions / opts.tileSize,
    height: dimensions,
    rows: dimensions / opts.tileSize,
    tile: opts.tileSize,
    width: dimensions
  }
}

module.exports = {
  getDimensions
}
