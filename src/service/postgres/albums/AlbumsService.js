const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { mapAlbumsDBToModel, mapSongsDBToModel } = require('../../../utils');

class AlbumsService {
  // Menambahkan cacheService
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapAlbumsDBToModel);
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // const album = albumResult.rows[0];
    const album = albumResult.rows.map(mapAlbumsDBToModel)[0];

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [album.id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const songs = songsResult.rows.map(mapSongsDBToModel);

    const response = {
      ...album,
      songs,
    };
    return response;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
  // Menambahakan Bagian Cover
  async editAlbumCoverById(albumId, url) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
      values: [url, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Cover Album gagal diperbarui. Id tidak ditemukan');
    }
  }


  // Menambahkan Bagian Like
  async addLikeAlbum(albumId, credentialId) {
    const check = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, credentialId],
    };

    const like = await this._pool.query(check);

    if (like.rowCount) {
      throw new InvariantError('Album sudah disukai');
    }

    const id = `albumLikes-${nanoid(15)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, credentialId, albumId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`user_album_likes:${id}`);
  }

  // Menambahkan deleteLikeAlbum
  async deleteLikeAlbum(albumId, credentialId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus Like, Album belum disukai');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
  }

  // Menambahkan Bagian getLikesAlbum
  async getLikesAlbum(id) {
    try {
      const result = await this._cacheService.get(`user_album_likes:${id}`);
      return {
        isCache: true,
        result: JSON.parse(result),
      };
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(`user_album_likes:${id}`, JSON.stringify(result.rowCount), 1800);

      return {
        isCache: false,
        result: result.rowCount,
      };
    }
  }
}

module.exports = AlbumsService;