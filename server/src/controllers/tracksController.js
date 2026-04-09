import Track from "../models/Track.js";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";
import User from "../models/User.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
};

export const listTracks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.album) {
      filter.album = req.query.album;
    }
    if (req.query.artist) {
      filter.artist = req.query.artist;
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      if (q) {
        filter.title = { $regex: new RegExp(escapeRegExp(q), "i") };
      }
    }

    const items = await Track.find(filter)
      .populate("artist", "name")
      .populate("album", "title coverUrl")
      .sort({ popularity: -1, title: 1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const listMyTracks = async (req, res, next) => {
  try {
    const items = await Track.find({ uploadedBy: req.user._id })
      .populate("artist", "name")
      .populate("album", "title coverUrl")
      .sort({ createdAt: -1, title: 1 });

    return res.json({ items });
  } catch (error) {
    return next(error);
  }
};

export const listLikedTracks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("likedTracks")
      .populate({
        path: "likedTracks",
        select: "title durationSec coverUrl audioUrl artist album",
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "artist", select: "name" },
          { path: "album", select: "title coverUrl" },
        ],
      });

    return res.json({ items: user?.likedTracks || [] });
  } catch (error) {
    return next(error);
  }
};

export const createTrack = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    const audioUrl = String(req.body.audioUrl || "").trim();
    const coverUrl = String(req.body.coverUrl || "").trim();
    const artistId = String(req.body.artistId || "").trim();
    const artistName = String(req.body.artistName || "").trim();
    const albumId = String(req.body.albumId || "").trim();
    const albumTitle = String(req.body.albumTitle || "").trim();
    const durationSec = parsePositiveInt(req.body.durationSec);
    const isExplicit = Boolean(req.body.isExplicit);
    const isVideo = Boolean(req.body.isVideo);
    const genre = String(req.body.genre || "").trim();
    const description = String(req.body.description || "").trim();

    if (!title) {
      return res.status(400).json({ message: "Missing title" });
    }

    if (!audioUrl) {
      return res.status(400).json({ message: "Missing audioUrl" });
    }

    let artist = null;
    if (artistId) {
      artist = await Artist.findById(artistId);
      if (!artist) {
        return res.status(400).json({ message: "Invalid artistId" });
      }
    } else if (artistName) {
      artist = await Artist.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(artistName)}$`, "i") },
      });
      if (!artist) {
        artist = await Artist.create({ name: artistName });
      }
    } else {
      return res.status(400).json({ message: "Missing artist" });
    }

    let album = null;
    if (albumId) {
      album = await Album.findById(albumId);
      if (!album) {
        return res.status(400).json({ message: "Invalid albumId" });
      }
    } else if (albumTitle) {
      album = await Album.findOne({
        artist: artist._id,
        title: { $regex: new RegExp(`^${escapeRegExp(albumTitle)}$`, "i") },
      });
      if (!album) {
        album = await Album.create({
          title: albumTitle,
          artist: artist._id,
          coverUrl: coverUrl,
        });
      }
    }

    const track = await Track.create({
      title,
      artist: artist._id,
      album: album?._id,
      durationSec,
      audioUrl,
      coverUrl: coverUrl || album?.coverUrl || "",
      isExplicit,
      isVideo,
      genre,
      description,
      uploadedBy: req.user._id,
    });

    if (album) {
      await Album.findByIdAndUpdate(album._id, {
        $addToSet: { tracks: track._id },
        $inc: { totalDuration: durationSec || 0 },
      });
    }

    const created = await Track.findById(track._id)
      .populate("artist", "name")
      .populate("album", "title coverUrl");

    return res.status(201).json({ item: created });
  } catch (error) {
    return next(error);
  }
};

export const likeTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id).select("_id");
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { likedTracks: track._id },
    });

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

export const unlikeTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id).select("_id");
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { likedTracks: track._id },
    });

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

export const getTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate("artist", "name")
      .populate("album", "title coverUrl");

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    return res.json({ item: track });
  } catch (error) {
    return next(error);
  }
};
