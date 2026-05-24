import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../constants/api";

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/post/fetch-photos`, {
          withCredentials: true,
        });
        setPhotos(data.photos || []);
      } catch (error) {
        console.error("Failed to load photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <div className="relative z-0 flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Photos</h1>
          <p className="text-sm text-gray-400 mt-1">
            Images shared by the FriendZone community
          </p>
        </header>

        {loading && (
          <div className="card p-8 text-center text-gray-400">Loading photos...</div>
        )}

        {!loading && !photos.length && (
          <div className="card p-10 text-center">
            <p className="text-gray-300 font-medium">No photos yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Create a post with an image to see it here.
            </p>
          </div>
        )}

        {!loading && photos.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {photos.map((photo) => (
              <figure
                key={photo._id}
                className="card break-inside-avoid mb-4 overflow-hidden group"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Post photo"}
                  className="w-full object-cover group-hover:scale-[1.02] transition duration-300"
                />
                {(photo.caption || photo.owner?.username) && (
                  <figcaption className="p-3 text-xs">
                    {photo.owner?.username && (
                      <span className="font-semibold text-primary-shade">
                        {photo.owner.username}
                      </span>
                    )}
                    {photo.caption && (
                      <p className="text-gray-400 mt-1 line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Photos;
