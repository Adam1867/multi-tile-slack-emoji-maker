const Jimp = require('jimp')
const { argv } = require('yargs')

const EMOJI_TILE_SIZE = 128

const filePath = process.argv.slice(2)[0]
const filename = filePath.replace(/^.*[\\\/]/, '')

function getMaxDimensions(image, tileSize) {
  const h = image.getHeight()
  const w = image.getWidth()
  const height = h - (h % tileSize)
  const width = w - (w % tileSize)

  return { height, width }
}

function getMaxSquareDimensions(image, tileSize) {
  const h = image.getHeight()
  const w = image.getWidth()
  const height = h - (h % tileSize)
  const width = w - (w % tileSize)

  const dimensions = Math.min(height, width)

  return { height: dimensions, width: dimensions }
}

async function main() {
  const image = await Jimp.read(filePath)

  // const { height, width } = getMaxDimensions(image, EMOJI_TILE_SIZE)
  const { height, width } = getMaxSquareDimensions(image, EMOJI_TILE_SIZE)

  const resized = image.clone().cover(width, height)
  resized.write(`./output/${filename}/original.${image.getExtension()}`)
}

main()
