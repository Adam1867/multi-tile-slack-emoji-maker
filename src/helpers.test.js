const path = require('path')
const Jimp = require('jimp')
const { getDimensions } = require('./helpers')

const fixturesPath = path.join(__dirname, '../fixtures')

describe('getDimensions()', () => {
  describe('square emojis', () => {
    test('should return the correct dimensions for a large image', async () => {
      const image = await Jimp.read(
        path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
      )

      expect(getDimensions(image)).toEqual({
        columns: 4,
        height: 512,
        rows: 4,
        tile: 128,
        width: 512
      })
    })

    test('should return the correct dimensions for a medium image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))

      expect(getDimensions(image)).toEqual({
        columns: 2,
        height: 256,
        rows: 2,
        tile: 128,
        width: 256
      })
    })

    test('should return the correct dimensions for a small image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'peng.jpeg'))

      expect(getDimensions(image)).toEqual({
        columns: 1,
        height: 128,
        rows: 1,
        tile: 128,
        width: 128
      })
    })

    // TODO: tests for diff tile size
  })

  describe('rectangular emojis', () => {
    test('should return the correct dimensions for a landscape image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))
      const options = { rectangular: true }

      expect(getDimensions(image, options)).toEqual({
        columns: 4,
        height: 512,
        rows: 7,
        tile: 128,
        width: 896
      })
    })

    test('should return the correct dimensions for a portrait image', async () => {
      const image = await Jimp.read(
        path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
      )
      const options = { rectangular: true }

      expect(getDimensions(image, options)).toEqual({
        columns: 5,
        height: 640,
        rows: 4,
        tile: 128,
        width: 512
      })
    })

    test('should return the correct dimensions for a portrait image if it falls outside the threshold (fallback to square)', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'feels_good.png'))
      const options = { rectangular: true }

      expect(getDimensions(image, options)).toEqual({
        columns: 4,
        height: 512,
        rows: 4,
        tile: 128,
        width: 512
      })
    })
  })
})
