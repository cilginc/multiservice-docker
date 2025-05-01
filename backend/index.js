const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createClient } = require('redis')

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
const REDIS_URL = process.env.REDIS_URI || 'redis://redis:6379'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const redisClient = createClient({ url: REDIS_URL })
redisClient.connect().catch(console.error)

const taskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  createdAt: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
})

const Task = mongoose.model('Task', taskSchema)

const TASKS_CACHE_KEY = 'tasks_cache'

app.get('/tasks', async (req, res) => {
  try {
    const cache = await redisClient.get(TASKS_CACHE_KEY)
    if (cache) {
      console.log('Cache Hit')
      return res.json(JSON.parse(cache))
    }

    console.log('Cache Miss')
    const tasks = await Task.find()
    const result = tasks.map((t) => ({ ...t.toObject(), id: t._id.toString() }))

    await redisClient.set(TASKS_CACHE_KEY, JSON.stringify(result), {
      EX: 60, // Cache 60 saniye geçerli
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/tasks', async (req, res) => {
  const { title, completed, createdAt, priority } = req.body
  const task = await Task.create({ title, completed, createdAt, priority })

  await redisClient.del(TASKS_CACHE_KEY)

  res.json({ ...task.toObject(), id: task._id.toString() })
})

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params
  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true })

  await redisClient.del(TASKS_CACHE_KEY)

  res.json({ ...updated.toObject(), id: updated._id.toString() })
})

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)

  await redisClient.del(TASKS_CACHE_KEY)

  res.json({ status: 'deleted' })
})

app.listen(PORT, () => console.log('API running at http://localhost:' + PORT))

