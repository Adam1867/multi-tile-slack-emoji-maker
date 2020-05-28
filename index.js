const prompts = require('prompts')
const Jimp = require('jimp')
const arg = require('arg')
const colors = require('colors')
const rimraf = require('rimraf')
const {
  createTiles,
  getBaseImage,
  getDimensions,
  getPossibleSizes,
  scaleImage
} = require('./src/helpers')

/* Define CLI Args */
const args = arg({
  // Types
  '--image': String, // --image <string>
  // Aliases
  '-i': '--image'
})

const EMOJI_TILE_SIZE = 128
const MAX_DIMENSIONS = 768

/**
 * Returns multidimensional array of Jimp images for a 2x2 emoji
 *
 * @param  {Jimp}   image    - a Jimp image file (resized)
 * @param  {number} tileSize - size in pixels of a slack emoji tile
 * @param  {string} size     - the desired emoji size (sm/md/lg)
 * @return {array}           - array containing the images needed for the emoji
 */
// function createEmoji(image, tileSize, size, name) {
//   const sizeMap = {
//     sm: 2,
//     md: 3,
//     lg: 4
//   }
//   const multiplier = sizeMap[size]

//   if (image.getWidth() < tileSize * multiplier) {
//     throw new Error(
//       `Image too small to be turned into a ${multiplier}x${multiplier} emoji`
//     )
//   }

//   const resized = image
//     .clone()
//     .cover(tileSize * multiplier, tileSize * multiplier)

//   const tiles = []
//   for (let i = 0; i < multiplier; i++) {
//     const row = []
//     for (let j = 0; j < multiplier; j++) {
//       row.push(
//         resized.clone().crop(j * tileSize, i * tileSize, tileSize, tileSize)
//       )
//     }
//     tiles.push(row)
//   }

//   tiles.forEach((row, rowIdx) => {
//     row.forEach((tile, tileIdx) =>
//       tile.write(
//         `./output/${name}/${size}/${rowIdx}-${tileIdx}.${tile.getExtension()}`
//       )
//     )
//   })
// }

/**
 * The main function of the app
 */
// async function main({ name, shape, sizes }) {
// const image = await Jimp.read(filePath)
// const { columns, height, rows, tile, width } = getDimensions(image, {
//   rectangular: shape
// })
// const resized = image.clone().cover(width, height)
// sizes.forEach(size => createEmoji(resized, tile, size, name))
// }

//   main(response)
// })()
async function main() {
  // grab supplied image path
  const filePath = args['--image']

  // load image
  const image = await Jimp.read(filePath)

  // scale image
  const scaledImaged = scaleImage(image, MAX_DIMENSIONS)

  // get valid emoji dimensions of the scaled image
  const dimensions = getDimensions(scaledImaged, { tileSize: EMOJI_TILE_SIZE })

  // throw error if image is too small
  if (!dimensions) throw new Error('Sorry, the image provided is too small.')

  // build prompts
  const questions = []
  questions.push({
    type: 'text',
    name: 'name',
    message: `What do you want the emoji to be called?`,
    validate: value => (!value ? `You must provide a name` : true)
  })
  if (dimensions.height !== dimensions.width) {
    questions.push({
      type: 'toggle',
      name: 'square',
      message: 'Do you want emoji to be square?',
      initial: true,
      active: 'Yes',
      inactive: 'No'
    })
  }
  // need to calculate what sm/md/lg are, and which options should show.
  // {
  //   type: 'multiselect',
  //   name: 'sizes',
  //   message: 'Pick emoji sizes',
  //   choices: [
  //     { title: 'Small', value: 'sm' },
  //     { title: 'Medium', value: 'md' },
  //     { title: 'Large', value: 'lg' }
  //   ],
  //   min: 1
  // }

  const choices = await prompts(questions)

  // get base image for dividing into tiles
  const baseImage = getBaseImage(scaledImaged, dimensions, {
    square: choices.square
  })

  // const sizes = getPossibleSizes(baseImage, EMOJI_TILE_SIZE)

  // save base image
  // baseImage.write(
  //   `./output/${choices.name}/original.${baseImage.getExtension()}`
  // )
  // console.log(
  //   colors.inverse('Created file:'),
  //   colors.green(
  //     `./output/${
  //       choices.name
  //     }/original.${baseImage.getExtension()} (${baseImage.getWidth()}x${baseImage.getHeight()})`
  //   )
  // )

  // get full sized emoji tiles
  const tiles = createTiles(baseImage, EMOJI_TILE_SIZE)

  // write tiles to output directory
  rimraf.sync(`./output/${choices.name}`)
  tiles.forEach((row, rowIdx) => {
    row.forEach((tile, tileIdx) =>
      tile.write(
        `./output/${choices.name}/${
          choices.name
        }-${rowIdx}-${tileIdx}.${tile.getExtension()}`
      )
    )
  })

  // foreach sizes as size
  // createTiledEmoji(baseImage, size, EMOJI_TILE_SIZE)
}

main().catch(err => console.error(err))
