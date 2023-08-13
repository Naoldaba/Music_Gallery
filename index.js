const main = document.querySelector('.main');
const gallery = document.querySelector('.gallery');
const createMusic=document.querySelector('.create_music');
createMusic.addEventListener('click', ()=>createNewMusic());
let data = [];

let global_id_count;


function createMusicCard(Music) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('data-id', Music.id.toString());

  const photo = document.createElement('img');
  photo.src = Music.thumbnailUrl;
  photo.alt = "thumbnailUrl";
  card.appendChild(photo);

  const musicInfo = document.createElement('div');
  musicInfo.classList.add('music-Info');

  const title = document.createElement('h3');
  title.textContent = Music.title;
  musicInfo.appendChild(title);

  const visitImg = document.createElement('a');
  visitImg.href = Music.url;
  visitImg.innerHTML = "View Image";
  musicInfo.appendChild(visitImg);

  card.appendChild(musicInfo);

  const lastContainer = document.createElement('div');
  lastContainer.classList.add('last-container');

  const del = document.createElement('button');
  del.textContent = 'Remove';
  del.classList.add('btn-delete');
  del.addEventListener('click', () => deleteCard(Music.id.toString()));

  const edit = document.createElement('button');
  edit.textContent = "Edit";
  edit.classList.add('btn-edit');
  edit.addEventListener('click',()=> editCard(Music.id.toString()));
  
  lastContainer.appendChild(del);
  lastContainer.appendChild(edit);

  musicInfo.appendChild(lastContainer);

  return card;
}


function fetchAlbumData(){
  return fetch('https://jsonplaceholder.typicode.com/albums')
          .then(response=>response.json())
          .then(albumData=>albumData.reduce((acc,album)=>{
            acc[album.id]=album.title;
            return acc;
          },{}))
}

async function displayGallery() {
  const albumData = await fetchAlbumData();

  fetch('https://jsonplaceholder.typicode.com/photos')
    .then(response => response.json())
    .then(fetchedData => {
      data = fetchedData.slice(0,150);
      gallery.innerHTML = "";

      const albumContainers = {}; 

      data.forEach(element => {
        const albumId = element.albumId;
        const albumTitle = albumData[albumId] || "Unknown Album";

        if (!albumContainers[albumId]) {
          const newAlbumContainer = document.createElement('div');
          newAlbumContainer.classList.add('album-container');
          newAlbumContainer.classList.add(`album-${albumId}`);

          const albumTitleElement = document.createElement('h1');
          albumTitleElement.textContent = `Album Title- ${albumTitle}`;
          albumTitleElement.classList.add('album-title')
          newAlbumContainer.appendChild(albumTitleElement);

          gallery.appendChild(newAlbumContainer);
          albumContainers[albumId] = newAlbumContainer;
        }

        const albumContainer = albumContainers[albumId];
        const musicCard = createMusicCard(element);
        albumContainer.appendChild(musicCard);
        global_id_count += 1;
      });
    })
    .catch(() => main.appendChild(errHandler()));
}


function errHandler() {
  const err = document.createElement('h3');
  err.textContent = "Oops! Couldn't fetch. Please check your internet connection!";
  err.classList.add('error');
  return err;
}

function createNewMusic() {
  
  const newTitle = prompt('Enter Title');
  const newAlbumId = prompt('Enter Album Id');
  const newThumbnailUrl = prompt('Enter Thumbnail URL');
  const newUrl = prompt('Enter Image URL');


  if (newTitle && newAlbumId && newThumbnailUrl && newUrl) {
    const newResource = {
      albumId: parseInt(newAlbumId),
      id: global_id_count + 1,
      title: newTitle,
      url: newUrl,
      thumbnailUrl: newThumbnailUrl
    };

    fetch(`https://jsonplaceholder.typicode.com/photos?albumId=${newResource.albumId}?id=${newResource.id}`, {
      method: 'POST',
      body: JSON.stringify(newResource),
      headers: { "Content-Type": "application/json" }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to add music to the album.');
      }
    })
    .then(newMusic => {
      const newCard = createMusicCard(newMusic);
      const albumContainer = document.querySelector(`.album-${newResource.albumId}`);

      if (albumContainer) {
        albumContainer.appendChild(newCard);
        console.log('Added music to album:', newMusic);
      } else {
        gallery.appendChild(newCard);
        console.log('Added music to the gallery:', newMusic);
      }
    })
    .catch(error => {
      console.error(error.message);
      alert("Couldn't upload music!");
    });
  } else {
    alert("Please fill in all fields to upload music!");
  }
}


function deleteCard(id) {
  fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      const cardToDelete = document.querySelector(`.card[data-id="${id}"]`);
      if (cardToDelete) {
        cardToDelete.remove(); 
        data = data.filter(photo => photo.id !== parseInt(id)); 
        console.log(`Deleted music with ID: ${id}`);
      }
    } else {
      throw new Error(`Failed to delete music with ID: ${id}`); 
    }
  })
  .catch(error => {
    console.error(error.message); 
  });
}


function editCard(id) {
  const musicToEdit = data.find(music => music.id.toString() === id);

  if (musicToEdit) {
    const newTitle = prompt('Enter new title:', musicToEdit.title);
    const newUrl = prompt('Enter new URL:', musicToEdit.url);

    if (newTitle !== null || newUrl !== null) {
      const updatedMusic = {
        ...musicToEdit,
        title: newTitle !== null && newTitle !== '' ? newTitle : musicToEdit.title,
        url: newUrl !== null && newUrl !== '' ? newUrl : musicToEdit.url,
      };

      fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedMusic),
        headers: { "Content-Type": "application/json" }
      })
      .then(response => {
        if (response.ok) {
          const cardToUpdate = document.querySelector(`.card[data-id="${id}"]`);

          if (cardToUpdate) {
            const titleElement = cardToUpdate.querySelector('h3');
            const visitImgElement = cardToUpdate.querySelector('.music-Info > a');
            
            if (titleElement && visitImgElement) {
              titleElement.textContent = updatedMusic.title;
              visitImgElement.href = updatedMusic.url;
              
              console.log('Edited music details:', updatedMusic);
            } else {
              console.error('Title or image element not found.');
            }
          }
        } else {
          console.error(`Failed to edit music with ID: ${id}`);
        }
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      console.log('No changes made.');
    }
  } else {
    console.log('Music not found.');
  }
}


  

displayGallery();
