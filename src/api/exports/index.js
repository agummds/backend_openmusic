const ExportsHandler = require('./handler');
const routes = require('./routes');

const PlaylistsService = require('../../service/postgres/playlistsservice/PlaylistsService');
const playlistsService = new PlaylistsService();

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator, playlistsService);
    server.route(routes(exportsHandler));
  },
};