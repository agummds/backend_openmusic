const AlbumsHandler = require('./handler');
const routes = require('./routes');

//menentukan modul plugin yang diimpor dan digunakan oleh bagian lain
module.exports = {
  name: 'open-music-albums',
  version: '1.0.0',
  register: async (server, { service, validator, storageService }) => {
    const albumsHandler = new AlbumsHandler(service, validator, storageService);
    server.route(routes(albumsHandler));
  },
};