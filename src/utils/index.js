const mapAlbumsDBToModel =({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapSongsDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  // eslint-disable-next-line camelcase
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  // eslint-disable-next-line camelcase
  albumId: album_id,
});

module.exports = { mapAlbumsDBToModel, mapSongsDBToModel };