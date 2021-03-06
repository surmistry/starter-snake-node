const bodyParser = require('body-parser')
const express = require('express')
const findBestDecision = require('./lib/matrix');
const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

const handleIndex = (request, response) => {
  const battlesnakeInfo = {
    apiversion: '1',
    author: 'Suraj Mistry',
    color: '#542E11',
    head: 'shac-caffeine',
    tail: 'shac-coffee'
  }
  response.status(200).json(battlesnakeInfo)
}

app.listen(PORT, () => console.log(`Example app listening at http://127.0.0.1:${PORT}`))



const handleStart = (request, response) => {
  const gameData = request.body

  console.log('START')
  response.status(200).send('ok')
}

const handleMove = (request, response) => {
  const gameData = request.body
  // const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
  const { move } = findBestDecision(gameData);
  cogameDatasole.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  const gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)