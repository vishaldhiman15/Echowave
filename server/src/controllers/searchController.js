import Artist from "../models/Artist.js";
import Track from "../models/Track.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const search = async (req, res, next) => {
  try {
    const raw = req.query.query ?? req.query.q ?? "";
    const query = String(raw).trim();

    if (!query) {
      return res.json({ tracks: [], artists: [] });
    }

    const regex = new RegExp(escapeRegExp(query), "i");

    const [tracks, artists] = await Promise.all([
      Track.find({ title: { $regex: regex } })
        .populate("artist", "name")
        .populate("album", "title coverUrl")
        .sort({ popularity: -1, title: 1 })
        .limit(20),
      Artist.find({ name: { $regex: regex } })
        .sort({ monthlyListeners: -1, name: 1 })
        .limit(20),
    ]);

    return res.json({ tracks, artists });
  } catch (error) {
    return next(error);
  }
};
