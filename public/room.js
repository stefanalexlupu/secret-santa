var socket = io({ transports: ['websocket'], upgrade: false });

socket.on('reconnect', () => {
  socket.emit('join-room', { userName: name, roomId: ROOM_ID, userToken: USER_ID, silent: true })
})

var USER_ID = ROOM_ADMIN_TOKEN || null

var name = prompt('Enter your nickname');
socket.emit('join-room', { userName: name, roomId: ROOM_ID, userToken: USER_ID })

var formElement = document.getElementById('newMessageForm');
var formInput = document.getElementById('m');
var messagesContainer = document.getElementById('messages');
var membersList = document.getElementById('members');
var secretSanta = document.getElementById('secret-santa')

function onRoomJoin(uuid) {
  console.log('joined', uuid)
  USER_ID = uuid
}

function onSecretSantaClick() {
  socket.emit('secret-santa', ROOM_ID)
}

function updateUsersList(users) {
  membersList.innerHTML = ''

  membersList.title = users.join(', ')
  
  if (users.length < 4) {
    membersList.innerHTML = users.join(', ')
    return
  }
  
  membersList.innerHTML = users.slice(0, 2).join(', ') + ' and ' + (users.length - 2) + ' others'
}

function addUserMessage(message) {
  var messageItem = document.createElement('li');
  messageItem.classList.add('message', 'p-2', 'bg-green-100', 'self-end', 'rounded-lg', 'my-2')
  messageItem.innerText = message;
  messagesContainer.appendChild(messageItem);
}

function onFormSubmit(event) {
  event.preventDefault();
  var message = formInput.value;
  formInput.value = ''
  socket.emit('chat-message', { userId: USER_ID, msg: message, roomId: ROOM_ID })
  addUserMessage(message)
  return false;
}

function onNewMessage(message) {
  var messageItem = document.createElement('li');
  messageItem.innerHTML = '<strong>' + message.sender + '</strong>' + ': ' + message.msg;
  messageItem.classList.add('message', 'p-2', 'bg-blue-200', 'rounded-lg', 'self-start', 'my-2')
  messagesContainer.appendChild(messageItem);
}

function onStatusUpdate(message) {
  var messageItem = document.createElement('li');
  messageItem.innerHTML = message;
  messageItem.classList.add('text-center', 'text-gray-700', 'my-2', 'itallic')
  messagesContainer.appendChild(messageItem);
}

formElement.addEventListener('submit', onFormSubmit);
if (secretSanta) {
  secretSanta.addEventListener('click', onSecretSantaClick);
}

socket.on('joined-room', onRoomJoin)
socket.on('chat-message', onNewMessage)
socket.on('user-connected', onStatusUpdate)
socket.on('user-disconnected', onStatusUpdate)
socket.on('secret-santa', onStatusUpdate)
socket.on('room-update', function onRoomUpdate(users) {
  console.log(users)
  updateUsersList(users)
})