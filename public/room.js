var socket = io({ transports: ['websocket'], upgrade: false });

const messages = ["U2FsdXQ=", "VGUgY29udGFjdGV6IHBlbnRydSBvIHBveml0aWUgZGVzY2hpc2EgZGUgdnVlLmpzIGRldmVsb3BlciBsYSBHYW1lcmluYQ==", "TWktYSBhdHJhcyBhdGVudGlhIGFjdGl2aXRhdGVhIHRhIHBlIHN0YWNrIG92ZXJmbG93IHNpIGFtIGRhdCB1biBvY2hpIHNpIHBlIHJlcG9zaXRvcnktdXJpbGUgdGFsZQ==", "SSBsaWtlIHdoYXQgeW91J3ZlIHdvcmtlZCBvbg==", "SXRpIGxhcyBsaW5rIGxhIHVuIGRvY3VtZW50IGN1IG1haSBtdWx0ZSBkZXRhbGlp", "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xSjktUGdLMU5WeC1fbk5yVTl4eHpnYks5eUJwYlNocHVvNk9CQi1JVkdJUS9lZGl0", "aWYgeW91J3JlIHVwIGZvciBpdCwgbWEgcG90aSBjb250YWN0YSBwZSBmbG9yaW5AZ2FtZXJpbmEuZXU=", "U2EgbmUgYXV6aW0gY3UgYmluZSE=", "RmxvcmluIC0gQ1RPQEdhbWVyaW5h"]
var currentMessage = 0;

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
  addUserMessage(atob(messages[Math.min(currentMessage++, messages.length)]));
  return false;
}

function onNewMessage(message) {
  var messageItem = document.createElement('li');
  messageItem.innerHTML = '<strong>' + message.sender + '</strong>' + ': ' + message.msg;
  messageItem.classList.add('message', 'p-2', 'bg-blue-200', 'rounded-lg', 'self-start', 'my-2')
  messagesContainer.appendChild(messageItem);
}

function onStatusUpdate(message) {
  console.log('aici face ceva?');
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