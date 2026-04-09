import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String, default: "" },
    genres: [{ type: String }],
    heroImage: { type: String, default: "" },
    monthlyListeners: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);
