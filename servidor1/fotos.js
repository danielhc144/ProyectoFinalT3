const API_URL = 'https://jsonplaceholder.typicode.com';

fetch(`${API_URL}/photos`)
  .then(response => response.json())
  .then(photos => {
    const appDiv = document.getElementById('app');
    const photoList = document.createElement('ul');

    photos.forEach(photo => {
      const photoItem = document.createElement('li');
      const photoImg = document.createElement('img');
      photoImg.src = photo.thumbnailUrl;
      photoImg.alt = photo.title;
      photoItem.appendChild(photoImg);
      photoList.appendChild(photoItem);
    });

    appDiv.appendChild(photoList);
  })
  .catch(error => console.error(error));
