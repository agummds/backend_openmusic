
class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    //this._albumsService = albumsService;
    //this._uploadsValidator = uploadsValidator;


    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.getLikesAlbumHandler = this.getLikesAlbumHandler.bind(this);
    this.deleteLikeAlbumHandler = this.deleteLikeAlbumHandler.bind(this);
    //this.postUploadImageHandler = this.postUploadImageHandler.bind(this);

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

    // Memastikan coverUrl ada, tidak tidak ada maka set menjadi null
    const coverUrl = album.coverUrl || null;

    return {
      status: 'success',
      data: {
        album,
        coverUrl,
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
  // Menambahakan Bagian Cover Handler
  // async postUploadImageHandler(request, h) {
  //   const { cover } = request.payload;
  //   const { id: albumId } = request.params;

  //   this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

  //   const filename = await this._service.writeFile(cover, cover.hapi);
  //   // eslint-disable-next-line no-undef
  //   const url = `http://${process.env.HOST}:${process.env.PORT}/upload/covers/${filename}`;
  //   await this._albumsService.updateCoverAlbumById(albumId, url);



  //   const response = h.response({
  //     status: 'success',
  //     data: {
  //       // eslint-disable-next-line no-undef
  //       fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/covers/${filename}`,
  //     },
  //   });
  //   response.code(201);
  //   return response;
  // }
  // Menambahakan Bagian postLikeAlbumHandler
  async postLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);
    await this._service.addLikeAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Album disukai',
    });
    response.code(201);
    return response;
  }
  // Menambahkan Bagian getLikesAlbumHandler
  async getLikesAlbumHandler(request, h) {
    const { id } = request.params;
    const { isCache, result } = await this._service.getLikesAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: result,
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    } else {
      response.header('X-Data-Source', 'not-cache');
    }
    return response;
  }
  // Menambahkan Bagian deleteLikeAlbumHandler
  async deleteLikeAlbumHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.deleteLikeAlbum(id, credentialId);

    return {
      status: 'success',
      message: 'Album tidak jadi disukai',
    };
  }
}

module.exports = AlbumsHandler;