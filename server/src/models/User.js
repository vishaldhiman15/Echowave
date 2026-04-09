import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    likedTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model("User", userSchema);
