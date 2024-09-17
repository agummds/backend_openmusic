const AlbumsHandler = require('./handler');
const routes = require('./routes');
const AlbumsService = require('../../service/postgres/albums/AlbumsService');
const albumsService = new AlbumsService();

//menentukan modul plugin yang diimpor dan digunakan oleh bagian lain
module.exports = {
  name: 'open-music-albums',
  version: '1.0.0',
  register: async (server, { service, validator, uploadsValidator  }) => {
    const albumsHandler = new AlbumsHandler(service, validator, uploadsValidator, albumsService) ;
    server.route(routes(albumsHandler));
  },
};