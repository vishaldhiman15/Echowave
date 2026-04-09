import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
    durationSec: { type: Number, default: 0 },
    audioUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    popularity: { type: Number, default: 0 },
    isExplicit: { type: Boolean, default: false },
    isVideo:    { type: Boolean, default: false },
    genre:      { type: String, default: '' },
    description:{ type: String, default: '' },
    plays:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Track", trackSchema);
