class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadAlbumCoverHandler = this.postUploadAlbumCoverHandler.bind(this);
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateAlbumCoverHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);

    // eslint-disable-next-line no-undef
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;

    this._albumsService.editAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Cover berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;