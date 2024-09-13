class PlaylistSongActivitiesHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistsService;

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistSongsAccess(playlistId, credentialId);

    const activities = await this._service.getPlaylistActivites(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongActivitiesHandler;