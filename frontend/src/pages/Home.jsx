import axios from "axios";
import { Feed, PostContainer, Stories } from "../components";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../context/MyContext";
import { API_BASE } from "../constants/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { socket, fetchPostAgain } = useContext(MyContext);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/post/fetch-post`, {
        withCredentials: true,
      });
      setPosts(data.posts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on("new post", fetchPosts);
    socket.on("new comment", fetchPosts);
    return () => {
      socket.off("new post", fetchPosts);
      socket.off("new comment", fetchPosts);
    };
  }, [socket]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPostAgain]);

  return (
    <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none custom-scrollbar">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Stories />
        <PostContainer />
        {posts.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            No posts yet. Share something with your friends!
          </div>
        ) : (
          posts.map((feed) => <Feed key={feed._id} feed={feed} />)
        )}
      </div>
    </main>
  );
}
