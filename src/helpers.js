/**
 * Gets the maximum image dimensions that would work as a slack emoji
 *
 * @param  {Jimp}    image               a Jimp image file
 * @param {object}   options
 * @param {number}   options.tileSize    size in pixels of a slack emoji tile
 * @param {boolean}  options.rectangular whether to allow portrait and landscape images to remain rectangular
 * @return {object}                      object containing the max emoji height and width
 */
function getMaxEmojiDimensions(image, options) {
  const defaultOptions = {
    ratioThreshold: 0.1, // todo - prevents rectangular images
    rectangular: false,
    tileSize: 128
  }
  const opts = { ...defaultOptions, ...options }

  const h = image.getHeight()
  const w = image.getWidth()
  const height = h - (h % opts.tileSize)
  const width = w - (w % opts.tileSize)

  // console.log(`before ratio: ${h / w}`)
  // console.log(`after ratio: ${height / width}`)
  // console.log(
  //   `within threshold: ${h / w - height / width <= opts.ratioThreshold}`
  // )
  const withinThreshold = h / w - height / width <= opts.ratioThreshold

  if (opts.rectangular && withinThreshold) return { height, width }

  const dimensions = Math.min(height, width)

  return { height: dimensions, width: dimensions }
}

module.exports = {
  getMaxEmojiDimensions
}
