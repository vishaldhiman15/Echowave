import Playlist from "../models/Playlist.js";

export const listPlaylists = async (req, res, next) => {
  try {
    const items = await Playlist.find()
      .populate("owner", "name avatarUrl")
      .populate({
        path: "tracks",
        select: "title durationSec coverUrl audioUrl",
        populate: { path: "artist", select: "name" },
      })
      .sort({ name: 1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const getPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("owner", "name avatarUrl")
      .populate({
        path: "tracks",
        select: "title durationSec coverUrl audioUrl",
        populate: { path: "artist", select: "name" },
      });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.json({ item: playlist });
  } catch (error) {
    return next(error);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Automatically generate a name if empty
    let playlistName = name?.trim();
    if (!playlistName) {
      const count = await Playlist.countDocuments({ owner: req.user._id });
      playlistName = `My Playlist #${count + 1}`;
    }

    const playlist = await Playlist.create({
      name: playlistName,
      description: description || "",
      owner: req.user._id,
      tracks: []
    });

    return res.status(201).json({ item: playlist });
  } catch (error) {
    return next(error);
  }
};
