import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

const getFilePath = (collectionName) => {
  const name = collectionName.toLowerCase();
  let filename = '';
  if (name === 'users' || name === 'user') filename = 'users.json';
  else if (name === 'jobs' || name === 'job') filename = 'jobs.json';
  else if (name === 'applications' || name === 'application') filename = 'applications.json';
  else if (name === 'savedjobs' || name === 'savedjob' || name === 'saved' || name === 'savedJobs') filename = 'savedJobs.json';
  else filename = `${collectionName}.json`;
  
  return path.join(dataDir, filename);
};

const ensureFileExists = (filePath) => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const readCollection = (collectionName) => {
  const filePath = getFilePath(collectionName);
  ensureFileExists(filePath);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
};

export const writeCollection = (collectionName, data) => {
  const filePath = getFilePath(collectionName);
  ensureFileExists(filePath);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing collection ${collectionName}:`, error);
  }
};

const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const createItem = async (collectionName, item) => {
  const data = readCollection(collectionName);
  const newItem = {
    _id: item._id || generateId(),
    ...item,
    createdAt: item.createdAt || new Date().toISOString()
  };
  
  if (collectionName.toLowerCase() === 'users' || collectionName.toLowerCase() === 'user') {
    if (newItem.password && !newItem.password.startsWith('$2a$') && !newItem.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      newItem.password = await bcrypt.hash(newItem.password, salt);
    }
  }
  
  data.push(newItem);
  writeCollection(collectionName, data);
  return newItem;
};

export const findItems = (collectionName, filterFn) => {
  const data = readCollection(collectionName);
  if (typeof filterFn === 'function') {
    return data.filter(filterFn);
  }
  if (filterFn && typeof filterFn === 'object') {
    return data.filter(item => {
      return Object.entries(filterFn).every(([key, val]) => {
        if (val && typeof val === 'object') {
          if (val.$in) {
            const itemVal = item[key];
            return Array.isArray(itemVal)
              ? itemVal.some(v => val.$in.includes(v))
              : val.$in.includes(itemVal);
          }
          if (val.$ne) {
            return item[key] !== val.$ne;
          }
        }
        const itemVal = item[key];
        const valStr = val ? val.toString() : '';
        const itemValStr = itemVal ? itemVal.toString() : '';
        return itemValStr === valStr;
      });
    });
  }
  return data;
};

export const findOne = (collectionName, filterFn) => {
  const data = readCollection(collectionName);
  if (typeof filterFn === 'function') {
    return data.find(filterFn) || null;
  }
  if (filterFn && typeof filterFn === 'object') {
    return data.find(item => {
      return Object.entries(filterFn).every(([key, val]) => {
        const itemVal = item[key];
        const valStr = val ? val.toString() : '';
        const itemValStr = itemVal ? itemVal.toString() : '';
        return itemValStr === valStr;
      });
    }) || null;
  }
  return data[0] || null;
};

export const updateItem = (collectionName, id, updateData) => {
  const data = readCollection(collectionName);
  const index = data.findIndex(item => item._id.toString() === id.toString());
  if (index === -1) return null;
  
  const fieldsToUpdate = updateData.$set || updateData;
  const updatedItem = {
    ...data[index],
    ...fieldsToUpdate,
    updatedAt: new Date().toISOString()
  };
  
  data[index] = updatedItem;
  writeCollection(collectionName, data);
  return updatedItem;
};

export const deleteItem = (collectionName, id) => {
  const data = readCollection(collectionName);
  const index = data.findIndex(item => item._id.toString() === id.toString());
  if (index === -1) return null;
  const deleted = data.splice(index, 1)[0];
  writeCollection(collectionName, data);
  return deleted;
};

export const seedMockData = async () => {
  const usersPath = getFilePath('users');
  const jobsPath = getFilePath('jobs');
  
  ensureFileExists(usersPath);
  ensureFileExists(jobsPath);
  
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  
  const recruiterId = '60d5ec49f30b9c3e98b7e6b1';
  
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    users.push({
      _id: recruiterId,
      name: "Mock Recruiter",
      email: "recruiter@example.com",
      password: hashedPassword,
      role: "recruiter",
      phone: "1234567890",
      skills: [],
      experience: "5 years",
      portfolio: "",
      github: "",
      linkedin: "",
      resume: "",
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
  
  if (jobs.length === 0) {
    const sampleJobs = [
      {
        _id: '60d5ec49f30b9c3e98b7e6b2',
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: '$80,000 - $100,000',
        jobType: 'Full-time',
        experience: '2+ years',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        description: 'We are looking for a skilled Frontend Developer to join our team.',
        responsibilities: ['Develop new user-facing features', 'Build reusable code and libraries for future use', 'Optimize application for maximum speed and scalability'],
        requirements: ['Proven work experience as a Frontend Developer', 'Hands on experience with markup languages', 'Familiarity with browser testing and debugging'],
        postedBy: recruiterId,
        createdAt: new Date().toISOString()
      },
      {
        _id: '60d5ec49f30b9c3e98b7e6b3',
        title: 'React Developer',
        company: 'WebSolutions',
        location: 'Remote',
        salary: '$90,000 - $110,000',
        jobType: 'Full-time',
        experience: '3+ years',
        skills: ['React', 'Redux', 'JavaScript', 'TailwindCSS'],
        description: 'Join our fast-growing startup as a React Developer.',
        responsibilities: ['Build high quality React components', 'Integrate frontend with backend APIs', 'Participate in code reviews'],
        requirements: ['In-depth knowledge of JavaScript and React', 'Experience with state management libraries like Redux', 'Good communication skills'],
        postedBy: recruiterId,
        createdAt: new Date().toISOString()
      },
      {
        _id: '60d5ec49f30b9c3e98b7e6b4',
        title: 'MERN Stack Developer',
        company: 'AppFactory',
        location: 'New York, NY',
        salary: '$100,000 - $130,000',
        jobType: 'Full-time',
        experience: '3+ years',
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        description: 'Looking for a full stack engineer proficient in the MERN stack.',
        responsibilities: ['Design and launch frontend and backend features', 'Maintain code quality and deployment pipelines', 'Work on database optimization'],
        requirements: ['Solid experience with MERN stack development', 'Familiarity with cloud hosting services (AWS/Heroku)', 'Strong problem solving skills'],
        postedBy: recruiterId,
        createdAt: new Date().toISOString()
      },
      {
        _id: '60d5ec49f30b9c3e98b7e6b5',
        title: 'Java Backend Developer',
        company: 'EnterpriseSys',
        location: 'Chicago, IL',
        salary: '$110,000 - $140,000',
        jobType: 'Full-time',
        experience: '4+ years',
        skills: ['Java', 'Spring Boot', 'SQL', 'Hibernate'],
        description: 'Seeking a Senior Java Backend Developer to scale our enterprise infrastructure.',
        responsibilities: ['Design robust APIs and microservices', 'Optimize database queries and transaction logic', 'Collaborate with frontend engineers'],
        requirements: ['Expertise in Java and Spring Boot framework', 'Experience with relational databases and SQL optimization', 'Familiarity with CI/CD concepts'],
        postedBy: recruiterId,
        createdAt: new Date().toISOString()
      },
      {
        _id: '60d5ec49f30b9c3e98b7e6b6',
        title: 'UI Developer',
        company: 'DesignCo',
        location: 'Hybrid (Boston, MA)',
        salary: '$75,000 - $95,000',
        jobType: 'Full-time',
        experience: '1+ years',
        skills: ['HTML', 'CSS', 'JavaScript', 'Figma', 'Sass'],
        description: 'Translate beautiful designs into semantic and pixel-perfect web pages.',
        responsibilities: ['Build UI components from design mockups', 'Ensure visual consistency and responsive design', 'Implement minor UI animations'],
        requirements: ['Proficient in HTML5, CSS3, and JavaScript', 'Familiarity with design tools like Figma or Sketch', 'Keen eye for typography and layout'],
        postedBy: recruiterId,
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(jobsPath, JSON.stringify(sampleJobs, null, 2));
  }
};
