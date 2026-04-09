import Album from "../models/Album.js";

export const listAlbums = async (req, res, next) => {
  try {
    const items = await Album.find()
      .populate("artist", "name heroImage")
      .sort({ year: -1, title: 1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const getAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artist", "name heroImage")
      .populate({
        path: "tracks",
        populate: { path: "artist", select: "name" },
      });
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    return res.json({ item: album });
  } catch (error) {
    return next(error);
  }
};
