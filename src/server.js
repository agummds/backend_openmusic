// Mengimpor dotenv dan menjalankan konfigurasi
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

// Bagian Albums
const albums = require('./api/albums');
const AlbumsServices = require('./service/postgres/albums/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Bagian Songs
const songs = require('./api/songs');
const SongsService = require('./service/postgres/songs/SongsService');
const SongsValidator = require('./validator/songs');

// Bagian Users
const users = require('./api/users');
const UsersService = require('./service/postgres/users/UsersService');
const UsersValidator = require('./validator/users');

// Bagian Antentikasi
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/autentikasi/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Bagian Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/collaborations/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');


// Bagian Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./service/postgres/playlistsservice/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// Bagian PlaylistsSongs
const playlistSong = require('./api/playlistssong');
const PlaylistsSongService = require('./service/postgres/playlistsongservice/PlaylistsSongService');
const PlaylistsSongValidator = require('./validator/playlistSong');

// Bagian Playlist Activities
const playlistActivities = require('./api/playlistsongactivities');
const PlaylistActivitiesService = require('./service/postgres/playlistactivities/PlaylistActivities');
const PlaylistActivitiesValidator = require('./validator/playlistSongActivities');

// Bagian Exports
const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// Bagian Uploads
const uploads = require('./api/uploads');
const StorageService = require('./service/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// Bagian Cache
const CacheService = require('./service/redis/CacheService');

// Bagian Error handling
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const albumsServices = new AlbumsServices(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistsSongService = new PlaylistsSongService(collaborationsService);
  const playlistActivitiesService = new PlaylistActivitiesService();
  // eslint-disable-next-line no-undef
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/covers'));


  const server = Hapi.server({
    // eslint-disable-next-line no-undef
    port: process.env.PORT,
    // eslint-disable-next-line no-undef
    host: process.env.HOST,
    debug:  {
      request:['error'],
    },
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    // eslint-disable-next-line no-undef
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      // eslint-disable-next-line no-undef
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },

    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsServices,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSong,
      options: {
        playlistsSongService,
        playlistsService,
        songsService,
        collaborationsService,
        validator: PlaylistsSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService, playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistActivities,
      options: {
        service: playlistActivitiesService,
        validator: PlaylistActivitiesValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator, playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // untuk mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // untuk penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // untuk mempertahankan penanganan client error
      if (!response.isServer) {
        return h.continue;
      }
      // untuk penanganan server error
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    // bagian jika bukan error, lanjutkan dengan response sebelumnya
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
