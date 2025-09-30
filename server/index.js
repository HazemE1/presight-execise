import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { faker } from '@faker-js/faker';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // adjust in production!
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const requestQueue = [];
const requestResults = new Map();

const generateProfiles = (count = 1000) => {
  const profiles = [];
  const hobbies = [
    "Reading", "Writing", "Swimming", "Running", "Cooking", "Photography", 
    "Painting", "Music", "Dancing", "Gaming", "Hiking", "Cycling", 
    "Traveling", "Gardening", "Fishing", "Skiing", "Tennis", "Basketball", 
    "Football", "Volleyball", "Chess", "Puzzles", "Knitting", "Sewing",
    "Woodworking", "Pottery", "Singing", "Acting", "Yoga", "Meditation"
  ];
  
  const nationalities = [
    "American", "British", "Canadian", "Australian", "German", "French", 
    "Italian", "Spanish", "Japanese", "Chinese", "Indian", "Brazilian", 
    "Mexican", "Russian", "Swedish", "Norwegian", "Dutch", "Belgian", 
    "Swiss", "Austrian", "Polish", "Czech", "Hungarian", "Romanian"
  ];

  for (let i = 0; i < count; i++) {
    const hobbyCount = Math.floor(Math.random() * 11); // 0-10 hobbies
    const selectedHobbies = faker.helpers.arrayElements(hobbies, hobbyCount);
    
    profiles.push({
      id: i + 1,
      avatar: faker.image.avatar(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
      nationality: faker.helpers.arrayElement(nationalities),
      hobbies: selectedHobbies
    });
  }
  
  return profiles;
};

const allProfiles = generateProfiles();

const getTopHobbies = () => {
  const hobbyCounts = {};
  allProfiles.forEach(profile => {
    profile.hobbies.forEach(hobby => {
      hobbyCounts[hobby] = (hobbyCounts[hobby] || 0) + 1;
    });
  });
  return Object.entries(hobbyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([hobby]) => hobby);
};

const getTopNationalities = () => {
  const nationalityCounts = {};
  allProfiles.forEach(profile => {
    nationalityCounts[profile.nationality] = (nationalityCounts[profile.nationality] || 0) + 1;
  });
  return Object.entries(nationalityCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([nationality]) => nationality);
};

// 1. Paginated profiles with filtering and search
app.get("/api/profiles", (req, res) => {
  const { page = 1, limit = 20, search = "", hobbies = "", nationalities = "" } = req.query;
  
  let filteredProfiles = [...allProfiles];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProfiles = filteredProfiles.filter(profile => 
      profile.first_name.toLowerCase().includes(searchLower) ||
      profile.last_name.toLowerCase().includes(searchLower)
    );
  }
  
  if (hobbies) {
    const hobbyFilters = hobbies.split(',').filter(Boolean);
    filteredProfiles = filteredProfiles.filter(profile =>
      hobbyFilters.some(hobby => profile.hobbies.includes(hobby))
    );
  }
  
  if (nationalities) {
    const nationalityFilters = nationalities.split(',').filter(Boolean);
    filteredProfiles = filteredProfiles.filter(profile =>
      nationalityFilters.includes(profile.nationality)
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);
  
  res.json({
    profiles: paginatedProfiles,
    total: filteredProfiles.length,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: endIndex < filteredProfiles.length
  });
});

app.get("/api/filters", (req, res) => {
  res.json({
    hobbies: getTopHobbies(),
    nationalities: getTopNationalities()
  });
});

// 2. Streaming API endpoint
app.get("/api/stream", (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const longText = faker.lorem.paragraphs(32);
  let index = 0;
  
  const sendChunk = () => {
    if (index < longText.length) {
      res.write(longText[index]);
      index++;
      setTimeout(sendChunk, 10); // Send one character every 10ms
    } else {
      res.end();
    }
  };
  
  sendChunk();
});

// 3. Webworker API endpoint
app.post("/api/process", (req, res) => {
  const requestId = Date.now() + Math.random();
  const requestData = req.body;
  
  // Add to queue
  requestQueue.push({
    id: requestId,
    data: requestData,
    timestamp: Date.now()
  });
  
  // Process in "webworker" (simulated with setTimeout)
  setTimeout(() => {
    const result = `Processed request ${requestId}: ${JSON.stringify(requestData)}`;
    requestResults.set(requestId, result);
    
    // Send result via websocket
    io.emit('requestResult', {
      requestId,
      result
    });
  }, 2000);
  
  res.json({ 
    status: 'pending', 
    requestId 
  });
});

// Get request result
app.get("/api/result/:requestId", (req, res) => {
  const { requestId } = req.params;
  const result = requestResults.get(parseInt(requestId));
  
  if (result) {
    res.json({ result });
  } else {
    res.json({ status: 'pending' });
  }
});

// WebSocket handlers
io.on("connection", (socket) => {
  console.log(`⚡️ New client connected: ${socket.id}`);

  socket.on("message", (data) => {
    console.log("📩 Received message:", data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
