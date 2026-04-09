import Track from "../models/Track.js";
import User from "../models/User.js";

export const getRecommendations = async (req, res, next) => {
  try {
    let recommendations = [];
    
    // Default fallback based on highest popularity
    const topTracks = await Track.find()
      .populate("artist", "name heroImage")
      .populate("album", "title coverUrl")
      .sort({ popularity: -1, plays: -1, _id: 1 })
      .limit(20);

    // If user is logged in, build personalized recommendations
    if (req.user) {
      const user = await User.findById(req.user._id).populate({
        path: "likedTracks",
        select: "artist genre popularity",
        populate: { path: "artist", select: "name" }
      });

      if (user && user.likedTracks.length > 0) {
        let artistCounts = {};
        let genreCounts = {};
        
        for (const t of user.likedTracks) {
          if (t.artist && t.artist._id) {
            artistCounts[t.artist._id] = (artistCounts[t.artist._id] || 0) + 1;
          }
          if (t.genre) {
            genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
          }
        }

        const topArtists = Object.keys(artistCounts).sort((a,b)=>artistCounts[b]-artistCounts[a]).slice(0,3);
        const topGenres = Object.keys(genreCounts).sort((a,b)=>genreCounts[b]-genreCounts[a]).slice(0,3);

        if (topArtists.length > 0) {
          const artistSimilarTracks = await Track.find({ artist: { $in: topArtists }, _id: { $nin: user.likedTracks } })
            .populate("artist", "name heroImage")
            .populate("album", "title coverUrl")
            .sort({ popularity: -1, plays: -1 })
            .limit(10);
          
          if (artistSimilarTracks.length > 0) {
             recommendations.push({
               title: "Because you liked certain artists",
               description: "Tracks from your favorite artists",
               style: "from-blue-700 via-purple-600 to-pink-500",
               tracks: artistSimilarTracks
             });
          }
        }

        if (topGenres.length > 0) {
           const genreTracks = await Track.find({ genre: { $in: topGenres }, _id: { $nin: user.likedTracks } })
             .populate("artist", "name heroImage")
             .populate("album", "title coverUrl")
             .sort({ popularity: -1, plays: -1 })
             .limit(10);
             
           if (genreTracks.length > 0) {
             recommendations.push({
               title: "Based on your top genres",
               description: "Tracks from genres you listen to",
               style: "from-green-600 to-teal-500",
               tracks: genreTracks
             });
           }
        }
        
        // Add discover weekly for users
        const discoverTracks = await Track.find({ _id: { $nin: user.likedTracks } })
             .populate("artist", "name heroImage")
             .populate("album", "title coverUrl")
             .sort({ createdAt: -1 })
             .limit(10);
        
        if (discoverTracks.length > 0) {
            recommendations.push({
               title: "Discover Weekly",
               description: "New music handpicked for you.",
               style: "from-yellow-500 to-orange-400",
               tracks: discoverTracks
             });
        }
      }
    }

    if (recommendations.length === 0 && topTracks.length > 0) {
       recommendations.push({
         title: "Global Top Hits",
         description: "The most popular tracks right now",
         style: "from-orange-600 to-red-500",
         tracks: topTracks.slice(0, 10)
       });
       
       recommendations.push({
         title: "Trending Today",
         description: "What's playing around the world",
         style: "from-yellow-500 to-orange-400",
         tracks: topTracks.slice(10, 20)
       });
    }

    return res.json({ groups: recommendations });
  } catch (error) {
    return next(error);
  }
};
