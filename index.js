require('dotenv').config()

const express = require('express')
// const cors = require('cors')
const morgan = require('morgan')
const Entry = require('./models/entry')

const PORT = process.env.PORT || 3001
const app = express()

morgan.token('content', (req) => {
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :content',
)

// I like this middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  return next(error)
}

// app.use(cors());
app.use(express.static('build'))
app.use(express.json())

app.use(requestLogger)

// const generateId = () => {
//   let num;
//   num = Math.floor(Math.random() * 9999);
//   while (entries.find((entry) => entry.id === num)) {
//     num = Math.floor(Math.random() * 9999);
//   }
//   return num;
// };

app.get('/api/persons', (request, response, next) => Entry.find({})
  .then((entries) => {
    response.status(200).json(entries).end()
  })
  .catch((error) => next(error)))

app.get('/info', (request, response, next) => Entry.countDocuments({})
  .then((count) => {
    response
      .status(200)
      .send(`<p>Phonebook has info for ${count} people</p><p>${Date()}</p>`)
      .end()
  })
  .catch((error) => next(error)))

app.get('/api/persons/:id', (request, response, next) => Entry.findById(request.params.id)
  .then((entry) => {
    if (entry) response.status(200).json(entry).end()
    else response.status(404).end()
  }).catch((error) => next(error)))

app.delete('/api/persons/:id', (request, response, next) => Entry.findByIdAndDelete(request.params.id)
  .then((entry) => {
    if (entry) response.status(204).end()
    else response.status(404).end()
  })
  .catch((error) => next(error)))

app.put('/api/persons/:id', (request, response, next) => {
  const data = request.body

  return Entry.findByIdAndUpdate(
    request.params.id,
    data,
    { runValidators: true },
  )
    .then((entry) => {
      if (entry) response.json(entry).end()
      else response.status(404).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body
  if (!data.name || !data.number) {
    response.status(400).json({ error: 'Missing name or number field' }).end()
    return
  }

  Entry.find({ name: data.name })
    .then((found) => {
      if (found.length > 0) {
        response.status(400).json({ error: 'Name must be unique' }).end()
        return
      }

      const entry = new Entry(data)

      entry.save().then((number) => {
        response.json(number).end()
      })
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
