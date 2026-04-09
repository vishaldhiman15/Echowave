import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    coverUrl: { type: String, default: "" },
    year: { type: Number, default: 0 },
    description: { type: String, default: "" },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
    totalDuration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Album", albumSchema);
