const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())

morgan.token('body', (req) => {
  return (req.method !== 'POST')
  ? ''
  : JSON.stringify(req.body)
})

app.use(morgan(':method :url :response-time :body'))
app.use(express.static('dist'))

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
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
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

app.post('/api/persons/', (request, response) => {
  const body = request.body
  console.log('request body is: ', body)
  if (body.name === undefined) {
    return response
      .status(404)
      .json({ error: 'name is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number || ''
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })  
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(404)
    .json({
      error: 'put request name missing'
    })
  }

  const id = body.id

  const updatedPerson = {
    id: id,
    name: body.name,
    number: body.number
  }

  persons = persons.map(p => p.id !== id ? p : updatedPerson)
  response.json(updatedPerson)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})