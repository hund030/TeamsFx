import {WordsToList} from '../src/utils/wordsToList'

test('WordsToList empty case', async () => {
  // Arrange
  const empty = ''

  // Act
  const words = WordsToList(empty)

  // Assert
  expect(words.length).toBe(0)
})
