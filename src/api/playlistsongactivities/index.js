const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');
const PlaylistsService = require('../../service/postgres/playlistsservice/PlaylistsService');

const playlistsService = new PlaylistsService();

module.exports = {
  name: 'playlistActivities',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(
      service,
      playlistsService,
      validator,
    );
    server.route(routes(playlistSongActivitiesHandler));
  },
};