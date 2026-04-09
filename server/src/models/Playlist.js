import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coverUrl: { type: String, default: "" },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", playlistSchema);
