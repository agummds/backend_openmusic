const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongActivitiesPayloadSchema } = require('./schema');

const PlaylistSongActivitiesValidator = {
  validatePlaylistSongActivitiesPayload: (payload) => {
    const validationResult = PlaylistSongActivitiesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongActivitiesValidator;