"use client"

import { useState, useEffect } from "react"
import { PlusCircle, CheckCircle2, Circle, Trash2, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  // API URL
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/tasks';

  // Load tasks from server
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error('Error loading tasks:', err))
  }, [])

  const addTask = async () => {
    if (newTask.trim() === '') return

    const task: Omit<Task, 'id'> = {
      title: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
    }

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    const newCreatedTask = await res.json()
    setTasks([...tasks, newCreatedTask])
    setNewTask('')
    setPriority('medium')
  }

  const toggleTaskStatus = async (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setTasks(updated)
    const task = updated.find((t) => t.id === id)
    if (task) {
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
    }
  }

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    await fetch(`${API}/${id}`, { method: 'DELETE' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200'
    }
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Task Manager</CardTitle>
          <CardDescription>Organize your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className={`${priority === "low" ? "bg-green-100" : ""}`}
                onClick={() => setPriority("low")}
                title="Low Priority"
              >
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${priority === "medium" ? "bg-yellow-100" : ""}`}
                onClick={() => setPriority("medium")}
                title="Medium Priority"
              >
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${priority === "high" ? "bg-red-100" : ""}`}
                onClick={() => setPriority("high")}
                title="High Priority"
              >
                <div className="h-3 w-3 rounded-full bg-red-500" />
              </Button>
            </div>
            <Button onClick={addTask}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active tasks. Add a new task to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTasks
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 }
                      return priorityOrder[a.priority] - priorityOrder[b.priority]
                    })
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTaskStatus(task.id)}
                            className="h-8 w-8"
                          >
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          </Button>
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(task.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(task.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No completed tasks yet.</div>
              ) : (
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskStatus(task.id)}
                          className="h-8 w-8 text-green-500"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                          <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {tasks.length} total tasks • {completedTasks.length} completed
          </div>
          {completedTasks.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setTasks(tasks.filter((task) => !task.completed))}>
              Clear completed
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
