const express = require('express');
const app = express();
const exhbs = require('express-handlebars');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const derange = require('derange');
const { v4: uuidV4} = require('uuid');

const rooms = {}
const users = {}

app.engine('hbs', exhbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home');
});

app.post('/room', (req, res) => {
  // create a new room and redirect user to it
  const newRoom = {
    admin_uuid: null // admin to be set when first user connects
  }
  const newRoomId = uuidV4()
  rooms[newRoomId] = newRoom

  res.status(201). send({ roomPath: '/room/' + newRoomId })
})

app.get('/room/:room', (req, res) => {
  const roomId = req.params.room
  const room = rooms[roomId]

  if(!room) {
    res.status(404).send('We can\'t find this room');
    return
  }
  const responseObject = { roomId: roomId }

  if (!room.admin_uuid) {
    roomAdminUUID = uuidV4()
    rooms[roomId].admin_uuid = roomAdminUUID
    responseObject.roomAdminToken = roomAdminUUID
  }
  res.render('room', responseObject);
})

io.on('connection', socket => {
  socket.on('join-room', ({ userName, roomId, userToken, silent }) => {
    const user = { roomId, userName, uuid: userToken || uuidV4(), socketId: socket.id }
    users[user.uuid] = user;
    if (!userToken) {
      socket.emit('joined-room', user.uuid)
    }
    socket.join(roomId);
    if (!silent) {
      socket.to(roomId).emit('user-connected', userName + ' joined the room');
      io.in(roomId).emit('room-update', Object.values(users).filter(user => user.roomId === roomId).map(({ userName }) => userName ))
    }
  })
  socket.on('chat-message', ({ userId, msg, roomId }) => {
    const pkg = { msg, sender: users[userId].userName }
    socket.to(roomId).broadcast.emit('chat-message', pkg);
  })
  socket.on('secret-santa', (roomId) => {
    const usersToShuffle = Object.values(users).filter(user => user.roomId === roomId)
    const shuffledUsers = derange(usersToShuffle)
    
    for (let i = 0; i < usersToShuffle.length; i++) {
      io.to(usersToShuffle[i].socketId).emit('secret-santa', '🎁&nbsp;&nbsp;You are ' + shuffledUsers[i].userName + '\'s secret santa!')
    }
  })
  socket.on('disconnect', (reason) => {
    let disconnectedUser = null;
    for (uuid in users) {
      if (users[uuid].socketId === socket.id) {
        disconnectedUser = users[uuid]
        break
      }
    }
    
    if (reason === 'transport close') {
      socket.to(disconnectedUser.roomId).emit('user-disconnected', disconnectedUser.userName + ' left the room');
      delete users[disconnectedUser.uuid]
      io.in(disconnectedUser.roomId).emit('room-update', Object.values(users).map(({ userName }) => userName ))
    }
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
