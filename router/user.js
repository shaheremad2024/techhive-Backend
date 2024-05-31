import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import { createTaskValidator, signupValidator, updateTaskValidator } from '../validators/userValidators.js';
import { validationResult } from 'express-validator';
import { authenticateToken, createJWT } from '../utils.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/signup',signupValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword },
          });
      
      res.json(user);
    } catch (error) {
        console.log(error.message);
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  router.post('/signin',signupValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
    const { username, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      const token = createJWT(user.id);
      
      res.json({ token:`Bearer ${token}` });
    } catch (error) {
        console.log(error.message)
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/tasks', authenticateToken, async (req, res) => {
    try {
      const { status, page = 1, pageSize = 10 } = req.query;
  
      if (status && status !== "DONE" && status !== "ACTIVE") {
        return res.status(400).json({ error: "Invalid status" });
      }
  
      const skip = (page - 1) * pageSize;
  
      // Find the user and their tasks with pagination
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          tasks: {
            where: {
              status: status || undefined,
            },
            skip,
            take: parseInt(pageSize),
          },
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Count the total number of tasks
      const totalTasks = await prisma.task.count({
        where: {
          userId: req.user.userId,
          status: status || undefined,
        },
      });
  
      // Calculate total pages
      const totalPages = Math.ceil(totalTasks / pageSize);
  
      res.json({ tasks: user.tasks, page, totalPages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  router.post('/task', authenticateToken, createTaskValidator, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { taskName } = req.body;
      const userId = req.user.userId;
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const task = await prisma.task.create({
        data: {
          taskName,
          userId,
        },
      })
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  router.get('/task/:taskId',authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    try {
      const task = await prisma.task.findFirst({
        where: { id:taskId,userId:req.user.userId },
      });
      if(!task) return res.status(404).json({error:"Can not find this task!"})
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: 'Error fetching tasks' });
    }
  });

  router.put('/task/:taskId',authenticateToken,updateTaskValidator, async (req, res) => {
    const { taskId } = req.params;
    try {
        const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      };
      const {status} = req.body;
      const task = await prisma.task.findFirst({
        where: { id:taskId,userId:req.user.userId },
      });
      if(!task) return res.status(404).json({error:"Can not find this task!"});
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
        },
      });
      res.json({task:updatedTask});
    } catch (error) {
      res.status(400).json({ error: 'Error fetching tasks' });
    }
  });
    
  router.delete('/task/:taskId',authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    try {
      await prisma.task.delete({
        where: { id:taskId,userId:req.user.userId },
      });
      res.json({msg:"Task has been deleted!"});
    } catch (error) {
      res.status(400).json({ error: 'Error fetching tasks' });
    }
  });

  export default router;