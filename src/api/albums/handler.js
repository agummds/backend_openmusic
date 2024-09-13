class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    // Melakukan validasi payload request dan kemudian diekstrak
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    // Penambahan album baru ke layanan dan kemudian mengembalikan respon sukses dengan ID
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album telah berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    // Mendapatkan ID album dari request dan mendapatkan detail album dan daftar lagu dari album
    const albums = await this._service.getAlbums();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }
  async getAlbumByIdHandler(request) {
    // Mendapatkan ID album dari request dan mendapatkan detail album dan daftar lagu dari album
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {

    // Memperbarui ID album dari request dan mendapatkan detail album dan daftar lagu dari album
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album telah berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    // Melakukan penghapusan ID album dari request
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album telah berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;