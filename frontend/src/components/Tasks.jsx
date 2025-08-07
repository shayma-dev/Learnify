import React, { useState } from 'react';
import {
  TextInput,
  Text,
  Button,
  NativeSelect,
  Checkbox,
  Group,
  ActionIcon,
  Paper,
  Tabs,
  Divider,
  Stack,
  Box
} from '@mantine/core';
import { modals} from '@mantine/modals';
import { DateInput } from '@mantine/dates';
import { MdDelete, MdEdit } from 'react-icons/md';
import { IoMdCalendar } from 'react-icons/io';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import '@mantine/dates/styles.css';
import './Tasks.css';

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');
  // Sample task data
  // In a real application, this would be fetched from an API or database
  // For simplicity, we use hardcoded data here
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Write History Essay',
      subject: 'World History',
      date: dayjs().add(2, 'days').format('DD-MM-YYYY'),
      completed: false
    },
    {
      id: 2,
      name: 'Prepare Presentation for Chemistry',
      subject: 'Physics',
      date: dayjs().add(5, 'days').format('DD-MM-YYYY'),
      completed: false
    },
    {
      id: 3,
      name: 'Read Chapter 5 of Biology',
      subject: 'Biology',
      date: dayjs().add(1, 'days').format('DD-MM-YYYY'),
      completed: true
    }
  ]);
  // Extend dayjs with isBetween plugin for date filtering
  // This allows us to filter tasks based on their due dates
  dayjs.extend(isBetween);
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'today') return dayjs(task.date, 'DD-MM-YYYY').isSame(dayjs(), 'day');
    if (activeTab === 'week') {
      const taskDate = dayjs(task.date, 'DD-MM-YYYY');
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      return taskDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
        }
      return true; 
    })
      const pendingTasks = filteredTasks.filter(task => !task.completed);
      const completedTasks = filteredTasks.filter(task => task.completed);

      const toggleTaskCompletion = (id) => {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
      };

  const openEditTaskModal = (task) => {
    let currentData = {
      name: task.name,
      subject: task.subject,
      date: dayjs(task.date, 'DD-MM-YYYY')
    };

    modals.open({
      title: 'Edit Task',
      children: (
        <Stack gap="sm">
          <TextInput
            label="Task Name"
            required
            defaultValue={currentData.name}
            onChange={(e) => (currentData.name = e.target.value)}
          />
          <DateInput
            label="Due Date"
            required
            defaultValue={currentData.date}
            onChange={(d) => (currentData.date = dayjs(d))}
            valueFormat="DD-MM-YYYY"
          />
          <NativeSelect
            label="Subject"
            required
            defaultValue={currentData.subject}
            data={['World History', 'Physics', 'Biology', 'Chemistry', 'Mathematics']}
            onChange={(e) => (currentData.subject = e.target.value)}
          />
          <Group mt="md" grow>
            <Button
              color="green"
              onClick={() => {
                if (!currentData.name.trim()) {
                  notifications.show({ title: 'Error', message: 'Task name is required', color: 'red' });
                  return;
                }
                setTasks(tasks.map(t => 
                  t.id === task.id ? { 
                    ...t, 
                    name: currentData.name,
                    date: currentData.date.format('DD-MM-YYYY'),
                    subject: currentData.subject
                  } : t
                ));
                modals.closeAll();
              }}
            >
              Save
            </Button>
            <Button variant="outline" onClick={() => modals.closeAll()}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ),
    });
  };
// Function to open modal for deleting a task
  const openDeleteTaskModal = (id) => {
    modals.openConfirmModal({
      title: 'Delete Task',
      children: <Text size="sm">Are you sure you want to delete this task?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => setTasks(tasks.filter(t => t.id !== id))
    });
  };
// Function to open modal for adding a new task
  const openAddTaskModal = () => {
    let newTask = {
      name: '',
      subject: 'World History',
      date: dayjs().add(1, 'day')
    };

    modals.open({
      title: 'Add New Task',
      children: (
        <Stack gap="sm">
          <TextInput
            label="Task Name"
            required
            onChange={(e) => (newTask.name = e.target.value)}
          />
          <DateInput
            label="Due Date"
            required
            defaultValue={newTask.date}
            onChange={(d) => (newTask.date = dayjs(d))}
            valueFormat="DD-MM-YYYY"
          />
          <NativeSelect
            label="Subject"
            required
            defaultValue={newTask.subject}
            data={['World History', 'Physics', 'Biology', 'Chemistry', 'Mathematics']}
            onChange={(e) => (newTask.subject = e.target.value)}
          />
          <Group mt="md" grow>
            <Button
              color="green"
              onClick={() => {
                if (!newTask.name.trim()) {
                  notifications.show({ title: 'Error', message: 'Task name is required', color: 'red' });
                  return;
                }
                setTasks([...tasks, {
                  id: Math.max(...tasks.map(t => t.id), 0) + 1,
                  name: newTask.name,
                  date: newTask.date.format('DD-MM-YYYY'),
                  subject: newTask.subject,
                  completed: false
                }]);
                modals.closeAll();
              }}
            >
              Add Task
            </Button>
            <Button variant="outline" onClick={() => modals.closeAll()}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  return (
    <div className="tasks-container">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="today">Today</Tabs.Tab>
          <Tabs.Tab value="week">This Week</Tabs.Tab>
          <Tabs.Tab value="subject">Subject</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Divider my="md" />

      <Box mb="xl">
        <Text size="lg" fw={600} mb="sm">Task List</Text>
        <Stack gap="xs">
          {pendingTasks.map(task => (
            <Paper key={task.id} p="sm" withBorder>
              <Group wrap="nowrap">
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                />
                <Box style={{ flex: 1 }}>
                  <Text fw={500}>{task.name}</Text>
                  <Group gap="xs" mt={4}>
                    <IoMdCalendar size={14} />
                    <Text size="sm" c="dimmed">
                      Due {dayjs(task.date, 'DD-MM-YYYY').format('dddd')} · {task.subject}
                    </Text>
                  </Group>
                </Box>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => openEditTaskModal(task)}
                  >
                    <MdEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => openDeleteTaskModal(task.id)}
                  >
                    <MdDelete size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Box>

      {completedTasks.length > 0 && (
        <Box>
          <Text size="lg" fw={600} mb="sm">Completed</Text>
          <Stack gap="xs">
            {completedTasks.map(task => (
              <Paper key={task.id} p="sm" withBorder bg="var(--mantine-color-gray-0)">
                <Group wrap="nowrap">
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                  <Box style={{ flex: 1 }}>
                    <Text fw={500} td="line-through" c="dimmed">{task.name}</Text>
                    <Group gap="xs" mt={4}>
                      <IoMdCalendar size={14} />
                      <Text size="sm" c="dimmed">
                        Due {dayjs(task.date, 'DD-MM-YYYY').format('dddd')} · {task.subject}
                      </Text>
                    </Group>
                  </Box>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      <Button 
        fullWidth 
        mt="md" 
        variant="light" 
        onClick={openAddTaskModal}
      >
        Add Task
      </Button>
    </div>
  );
}