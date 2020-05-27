const prompts = require('prompts')
const Jimp = require('jimp')
const { argv } = require('yargs')
const { getDimensions } = require('./src/helpers')

const EMOJI_TILE_SIZE = 128

const filePath = process.argv.slice(2)[0]
const filename = filePath.replace(/^.*[\\\/]/, '')

/**
 * Returns multidimensional array of Jimp images for a 2x2 emoji
 *
 * @param  {Jimp}   image    - a Jimp image file (resized)
 * @param  {number} tileSize - size in pixels of a slack emoji tile
 * @param  {string} size     - the desired emoji size (sm/md/lg)
 * @return {array}           - array containing the images needed for the emoji
 */
function createEmoji(image, tileSize, size, name) {
  const sizeMap = {
    sm: 2,
    md: 3,
    lg: 4
  }
  const multiplier = sizeMap[size]

  if (image.getWidth() < tileSize * multiplier) {
    throw new Error(
      `Image too small to be turned into a ${multiplier}x${multiplier} emoji`
    )
  }

  const resized = image
    .clone()
    .cover(tileSize * multiplier, tileSize * multiplier)

  const tiles = []
  for (let i = 0; i < multiplier; i++) {
    const row = []
    for (let j = 0; j < multiplier; j++) {
      row.push(
        resized.clone().crop(j * tileSize, i * tileSize, tileSize, tileSize)
      )
    }
    tiles.push(row)
  }

  tiles.forEach((row, rowIdx) => {
    row.forEach((tile, tileIdx) =>
      tile.write(
        `./output/${name}/${size}/${rowIdx}-${tileIdx}.${tile.getExtension()}`
      )
    )
  })
}

async function main({ name, shape, sizes }) {
  const image = await Jimp.read(filePath)

  const { columns, height, rows, tile, width } = getDimensions(image, {
    rectangular: shape
  })

  const resized = image.clone().cover(width, height)

  sizes.forEach(size => createEmoji(resized, tile, size, name))
}

// self-invoking async function to run app
;(async () => {
  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: `What do you want the emoji to be called?`,
      validate: value => (!value ? `You must provide a name` : true)
    },
    {
      type: 'toggle',
      name: 'shape',
      message: 'Square or rectangle emoji?',
      initial: false,
      active: 'rectangle',
      inactive: 'square'
    },
    {
      type: 'multiselect',
      name: 'sizes',
      message: 'Pick emoji sizes',
      choices: [
        { title: 'Small', value: 'sm' },
        { title: 'Medium', value: 'md' },
        { title: 'Large', value: 'lg' }
      ],
      min: 1
    }
  ])

  main(response)
})()
