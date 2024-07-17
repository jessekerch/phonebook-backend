const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('body', (req) => {
  return (req.method !== 'POST')
  ? ''
  : JSON.stringify(req.body)
})

app.use(morgan(':method :url :response-time :body'))
app.use(express.static('dist'))

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const count = persons.length
  const now = new Date()

  response.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${now}</p>
    `)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

const generateId = () => {
  let id = Math.ceil(Math.random() * 10000)
  console.log('generating new id')
  while (persons.find(p => p.id === String(id))) {
    console.log('generating new id')
    id = generateId()
  }

  return String(id)
}

const personExists = (person) => {
  return persons.find(p => p.name === person.name)
}

app.post('/api/persons/', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(404)
    .json({
      error: 'name missing'
    })
  }

  const randomId = generateId()

  const person = {
    id: randomId,
    name: body.name,
    number: body.number
  }

  if (personExists(person)) {
    return response.status(409)
    .json({
      error: 'name must be unique'
    })
  } else {
    persons = persons.concat(person)
    response.json(person)
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})