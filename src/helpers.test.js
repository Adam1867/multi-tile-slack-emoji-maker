const path = require('path')
const Jimp = require('jimp')
const { getMaxEmojiDimensions } = require('./helpers')

const fixturesPath = path.join(__dirname, '../fixtures')

describe('getMaxEmojiDimensions()', () => {
  describe('square emojis', () => {
    test('should return the correct dimensions for a large image', async () => {
      const image = await Jimp.read(
        path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
      )

      expect(getMaxEmojiDimensions(image)).toEqual({
        height: 512,
        width: 512
      })
    })

    test('should return the correct dimensions for a medium image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'kitkat.jpg'))

      expect(getMaxEmojiDimensions(image)).toEqual({
        height: 256,
        width: 256
      })
    })

    test('should return the correct dimensions for a small image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'peng.jpeg'))

      expect(getMaxEmojiDimensions(image)).toEqual({
        height: 128,
        width: 128
      })
    })
  })

  describe('rectangular emojis', () => {
    test('should return the correct dimensions for a landscape image', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'stonks.jpeg'))
      const options = { rectangular: true }

      expect(getMaxEmojiDimensions(image, options)).toEqual({
        height: 512,
        width: 896
      })
    })

    test('should return the correct dimensions for a portrait image', async () => {
      const image = await Jimp.read(
        path.join(fixturesPath, 'to-sloth-and-beyond.jpg')
      )
      const options = { rectangular: true }

      expect(getMaxEmojiDimensions(image, options)).toEqual({
        height: 640,
        width: 512
      })
    })

    test('should return the correct dimensions for a portrait image if it falls outside the threshold (fallback to square)', async () => {
      const image = await Jimp.read(path.join(fixturesPath, 'feels_good.png'))
      const options = { rectangular: true }

      expect(getMaxEmojiDimensions(image, options)).toEqual({
        height: 512,
        width: 512
      })
    })
  })
})
