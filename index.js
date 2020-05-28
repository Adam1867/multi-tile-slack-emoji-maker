const prompts = require('prompts')
const Jimp = require('jimp')
const arg = require('arg')
const colors = require('colors')
const rimraf = require('rimraf')
const {
  createTiles,
  getBaseImage,
  getDimensions,
  getMaxSize,
  scaleImage
} = require('./src/helpers')

/* Define CLI Args */
const args = arg({
  // Types
  '--image': String, // --image <string>
  // Aliases
  '-i': '--image'
})

/* Constants */
const EMOJI_TILE_SIZE = 128
const MAX_DIMENSIONS = 768

async function main() {
  // grab supplied image path
  const filePath = args['--image']

  // load image
  const image = await Jimp.read(filePath)

  // scale image
  const scaledImage = scaleImage(image, MAX_DIMENSIONS)
  console.log(
    '🎨 ->',
    colors.cyan(
      `Scaled original image (${image.getWidth()}x${image.getHeight()}px) to max dimensions of ${scaledImage.getWidth()}x${scaledImage.getHeight()}px`
    )
  )

  // get valid emoji dimensions of the scaled image
  const dimensions = getDimensions(scaledImage, { tileSize: EMOJI_TILE_SIZE })

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
  /* for now always make square */
  // if (dimensions.height !== dimensions.width) {
  //   questions.push({
  //     type: 'toggle',
  //     name: 'square',
  //     message: 'Do you want emoji to be square?',
  //     initial: true,
  //     active: 'Yes',
  //     inactive: 'No'
  //   })
  // }

  const choices = await prompts(questions)

  // get base image for dividing into tiles
  const baseImage = getBaseImage(scaledImage, dimensions, {
    /* for now force to be square */
    // square: choices.square
  })
  console.log(
    '🎨 ->',
    colors.cyan(
      `Cropped image to ${baseImage.getWidth()}x${baseImage.getHeight()}px so it can be correctly tiled`
    )
  )

  // get valid emoji sizes (square only) and prompt user which they want
  const maxSize = getMaxSize(baseImage, EMOJI_TILE_SIZE)
  if (maxSize < 2)
    throw new Error("What's the point in making a multitile 1x1 emoji?!")
  const sizeQuestion = {
    type: 'multiselect',
    name: 'sizes',
    message: 'Which emoji sizes would you like?',
    choices: [],
    min: 1
  }
  for (let d = 2; d <= maxSize; d++) {
    sizeQuestion.choices.push({
      title: `${d * EMOJI_TILE_SIZE}px (${d}x${d} tiles)`,
      value: d
    })
  }
  const sizeChoice = await prompts(sizeQuestion)

  /* for now don't save base resized image */
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
  sizeChoice.sizes.forEach(size => {
    const resizedImage = baseImage
      .clone()
      .cover(size * EMOJI_TILE_SIZE, size * EMOJI_TILE_SIZE)
    const tiles = createTiles(resizedImage, EMOJI_TILE_SIZE)
    tiles.forEach((row, rowIdx) => {
      row.forEach((tile, tileIdx) =>
        tile.write(
          `./output/${choices.name}/${size}x${size}/${
            choices.name
          }-${rowIdx}-${tileIdx}.${tile.getExtension()}`
        )
      )
    })
    console.log(
      '🎨 ->',
      colors.cyan(
        `Wrote ${size}x${size} emoji tiles to ./output/${choices.name} directory`
      )
    )
  })
}

main().catch(err => console.error(err))
