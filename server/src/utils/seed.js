import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";
import Track from "../models/Track.js";
import Playlist from "../models/Playlist.js";
import User from "../models/User.js";
import {
  artistSeeds,
  albumSeeds,
  trackSeeds,
  playlistSeeds,
} from "./seedData.js";

dotenv.config();

const runSeed = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/echowave";
    await mongoose.connect(uri);

    await Promise.all([
      User.deleteMany({}),
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Track.deleteMany({}),
      Playlist.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "Echo User",
      email: "user@echowave.local",
      passwordHash,
      avatarUrl: "/assets/img/avatar-1.svg",
    });

    const artists = await Artist.insertMany(artistSeeds);

    const albumsToInsert = albumSeeds.map((album) => ({
      title: album.title,
      artist: artists[album.artistIndex]._id,
      coverUrl: album.coverUrl,
      year: album.year,
      description: album.description,
    }));

    const albums = await Album.insertMany(albumsToInsert);

    const tracksToInsert = trackSeeds.map((track) => ({
      title: track.title,
      uploadedBy: user._id,
      artist: artists[track.artistIndex]._id,
      album: albums[track.albumIndex]._id,
      durationSec: track.durationSec,
      coverUrl: track.coverUrl,
      popularity: track.popularity,
    }));

    const tracks = await Track.insertMany(tracksToInsert);

    await User.findByIdAndUpdate(user._id, {
      likedTracks: tracks.slice(0, 5).map((track) => track._id),
    });

    const albumTrackMap = tracks.reduce((acc, track) => {
      const key = track.album.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(track);
      return acc;
    }, {});

    await Promise.all(
      albums.map((album) => {
        const albumTracks = albumTrackMap[album._id.toString()] || [];
        const totalDuration = albumTracks.reduce(
          (sum, track) => sum + (track.durationSec || 0),
          0
        );
        return Album.findByIdAndUpdate(album._id, {
          tracks: albumTracks.map((track) => track._id),
          totalDuration,
        });
      })
    );

    const playlistsToInsert = playlistSeeds.map((playlist) => ({
      name: playlist.name,
      description: playlist.description,
      coverUrl: playlist.coverUrl,
      owner: user._id,
      tracks: playlist.trackIndexes.map((index) => tracks[index]._id),
    }));

    await Playlist.insertMany(playlistsToInsert);

    console.log("Seed complete");
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
