import Artist from "../models/Artist.js";

export const listArtists = async (req, res, next) => {
  try {
    const items = await Artist.find().sort({ monthlyListeners: -1, name: 1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    return res.json({ item: artist });
  } catch (error) {
    return next(error);
  }
};
