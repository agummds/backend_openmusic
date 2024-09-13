const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsSongService,
    playlistsService,
    songsService,
    collaborationsService,
    validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistsSongService,
      validator,
      playlistsService,
      songsService,
      collaborationsService,
    );
    server.route(routes(playlistSongsHandler));
  },
};