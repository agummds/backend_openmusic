const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');

class PlaylistsSongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const checkSong = {
      text: 'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const checkSongResult = await this._pool.query(checkSong);

    if (checkSongResult.rows.length > 0) {
      throw new InvariantError('Tidak dapat ditambahkan, lagu telah terdaftar dalam playlist');
    }

    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu tidak berhasil ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(id) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlists = result.rows[0];

    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer 
        FROM playlist_songs
        LEFT JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    if (!songsResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    const songs = songsResult.rows;
    const response = {
      ...playlists,
      songs,
    };

    return response;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async addActivity({
    playlistId, songId, credentialId, action, time,
  }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, credentialId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistsSongService;