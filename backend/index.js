const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = 5000

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://mongodb:27017/tasks", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const taskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  createdAt: String,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
})

const Task = mongoose.model('Task', taskSchema)

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find()
  res.json(tasks.map((t) => ({ ...t.toObject(), id: t._id.toString() })))
})

app.post('/tasks', async (req, res) => {
  const { title, completed, createdAt, priority } = req.body
  const task = await Task.create({ title, completed, createdAt, priority })
  res.json({ ...task.toObject(), id: task._id.toString() })
})

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params
  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true })
  res.json({ ...updated.toObject(), id: updated._id.toString() })
})

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  res.json({ status: 'deleted' })
})

app.listen(PORT, () => console.log('API running at http://localhost:' + PORT))

