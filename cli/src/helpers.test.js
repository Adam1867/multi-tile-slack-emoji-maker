const path = require('path')
const Jimp = require('jimp')
const {
  createTiles,
  getBaseImage,
  getDimensions,
  getMaxSize,
  scaleImage
} = require('./helpers')

const fixturesPath = path.join(__dirname, '../../fixtures')

describe('scaleImage()', () => {
  test('should scale down large images', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))
    const scaled = scaleImage(image, 768)

    expect(scaled.getHeight()).toEqual(460)
    expect(scaled.getWidth()).toEqual(768)
  })

  test('should not scale valid sized images', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
    )
    const scaled = scaleImage(image, 768)

    expect(scaled.getHeight()).toEqual(765)
    expect(scaled.getWidth()).toEqual(600)
  })

  test("should not scale if max dimensions aren't provideds", async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))
    const scaled = scaleImage(image)

    expect(scaled.getHeight()).toEqual(539)
    expect(scaled.getWidth()).toEqual(900)
  })
})

describe('getDimensions()', () => {
  test('should return the correct dimensions for a portrait image', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
    )

    expect(getDimensions(image)).toEqual({
      // columns: 4,
      height: 640,
      // rows: 5,
      // tile: 128,
      width: 512
    })
  })

  test('should return the correct dimensions for a landcape image', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'peng.jpeg'))

    expect(getDimensions(image)).toEqual({
      // columns: 2,
      height: 128,
      // rows: 1,
      // tile: 128,
      width: 256
    })
  })

  test('should return the correct dimensions for a square image', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))

    expect(getDimensions(image)).toEqual({
      // columns: 2,
      height: 256,
      // rows: 2,
      // tile: 128,
      width: 256
    })
  })

  test('should return the correct dimensions for different tile sizes', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))

    expect(getDimensions(image, { tileSize: 64 })).toEqual({
      // columns: 4,
      height: 256,
      // rows: 4,
      // tile: 64,
      width: 256
    })
  })

  test('should return null for invalid images', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'football-frenzy.jpg')
    )

    expect(getDimensions(image)).toEqual(null)
  })
})

describe('getBaseImage()', () => {
  test('should return the correct base image for a rectangular emoji', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))
    const dimensions = getDimensions(image)
    const base = getBaseImage(image, dimensions, { square: false })
    expect(base.getHeight()).toEqual(512)
    expect(base.getWidth()).toEqual(896)
  })

  test('should return the correct base image for a square emoji', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'peng.jpeg'))
    const dimensions = getDimensions(image)
    const base = getBaseImage(image, dimensions, { square: true })
    expect(base.getHeight()).toEqual(128)
    expect(base.getWidth()).toEqual(128)
  })

  test('should return the correct base image when image happens to be square already', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))
    const dimensions = getDimensions(image)
    const base = getBaseImage(image, dimensions, { square: false })
    expect(base.getHeight()).toEqual(256)
    expect(base.getWidth()).toEqual(256)
  })

  test('should return the correct base image options are missing', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
    )
    const dimensions = getDimensions(image)
    const base = getBaseImage(image, dimensions)
    expect(base.getHeight()).toEqual(512)
    expect(base.getWidth()).toEqual(512)
  })
})

describe('getMaxSize()', () => {
  test('should return the maximum number of vertical and horizontal tiles for a square image', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'stonks--base-square.jpeg')
    )
    expect(getMaxSize(image, 128)).toEqual(3)
  })

  test('should throw if image is rectangular', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks--base.jpeg'))
    expect(() => {
      getMaxSize(image, 64)
    }).toThrow()
  })

  test('should throw if image is not a valid size', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))
    expect(() => {
      getMaxSize(image, 128)
    }).toThrow()
  })
})

describe('createTiles()', () => {
  test('should return the correct tiles array for a rectangular emoji', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks--base.jpeg'))
    const tiles = createTiles(image, 128)

    expect(tiles.length).toEqual(3)
    expect(tiles[0].length).toEqual(6)
    expect(tiles[1].length).toEqual(6)
    expect(tiles[2].length).toEqual(6)
    expect(tiles[0][0].getHeight()).toEqual(128)
    expect(tiles[0][0].getWidth()).toEqual(128)
  })

  test('should return the correct tiles array for a rectangular emoji', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'stonks--base-square.jpeg')
    )
    const tiles = createTiles(image, 128)

    expect(tiles.length).toEqual(3)
    expect(tiles[0].length).toEqual(3)
    expect(tiles[1].length).toEqual(3)
    expect(tiles[2].length).toEqual(3)
    expect(tiles[0][0].getHeight()).toEqual(128)
    expect(tiles[0][0].getWidth()).toEqual(128)
  })

  test('should return the correct tiles array for different individual tile sizes', async () => {
    const image = await Jimp.read(
      path.join(fixturesPath, 'stonks--base-square.jpeg')
    )
    const tiles = createTiles(image, 64)

    expect(tiles.length).toEqual(6)
    expect(tiles[0].length).toEqual(6)
    expect(tiles[1].length).toEqual(6)
    expect(tiles[2].length).toEqual(6)
    expect(tiles[3].length).toEqual(6)
    expect(tiles[4].length).toEqual(6)
    expect(tiles[5].length).toEqual(6)
    expect(tiles[0][0].getHeight()).toEqual(64)
    expect(tiles[0][0].getWidth()).toEqual(64)
  })

  test('should throw if an invalid image is provided', async () => {
    const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))

    expect(() => {
      const tiles = createTiles(image, 128)
    }).toThrow()
  })

  // TODO: test tiles are actually correct (correct order etc.)
})
