var createRoomBtn = document.getElementById('create-room');

createRoomBtn.addEventListener('click', () => {
  fetch('/room', {
    method: 'POST'
  }).then(response => {
    if (response.status === 201) {
      return response.json()
    }

    return Promise.reject('Failed to create room')
  })
  .then(data => {
    if (data.roomPath) {
      return window.location = data.roomPath
    }

    return Promise.reject('No room path')
  })
  .catch(error => {
    console.error(error)
  })
})