import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/MyContext";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { AiOutlineComment, AiOutlineSend } from "react-icons/ai";
import axios from "axios";
import { API_BASE } from "../../constants/api";

const Feed = ({ feed }) => {
  const [openComments, setOpenComments] = useState(false);
  const { loggedUser } = useContext(MyContext);
  const [comment, setComment] = useState("");
  const [postComments, setPostComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addComments = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/post/add-comment`,
        { comment, post: feed },
        { withCredentials: true }
      );
      setPostComments(response.data.thisPost.comments);
      setComment("");
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setPostComments(feed.comments || []);
  }, [feed.comments]);

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!submitting) addComments();
    }
  };

  return (
    <article className="card w-full my-3 overflow-hidden">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
            src={feed.owner.pic}
            alt={feed.owner.username}
          />
          <div>
            <p className="text-sm font-semibold">{feed.owner.username}</p>
            <p className="text-xs text-gray-500">FriendZone member</p>
          </div>
        </div>
      </header>

      {feed.content.caption && (
        <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap">
          {feed.content.caption}
        </p>
      )}

      {feed.content.pic && (
        <img
          className="w-full max-h-[420px] object-cover"
          src={feed.content.pic}
          alt="Post"
        />
      )}

      <footer className="px-4 py-4 border-t border-white/5">
        <div className="flex items-start gap-3">
          <img
            className="w-8 h-8 rounded-full object-cover shrink-0"
            src={loggedUser?.pic}
            alt=""
          />
          <div className="flex-1 flex gap-2">
            <input
              className="input-field flex-1 py-2"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              disabled={submitting}
            />
            <button
              type="button"
              onClick={addComments}
              disabled={submitting || !comment.trim()}
              className="shrink-0 p-2.5 rounded-full bg-primary-shade text-white hover:bg-sky-400 transition disabled:opacity-40"
            >
              <AiOutlineSend className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          {postComments.length > 0 ? (
            <button
              type="button"
              onClick={() => setOpenComments(!openComments)}
              className="flex items-center gap-1 font-medium hover:text-primary-shade transition"
            >
              <AiOutlineComment className="w-4 h-4" />
              {openComments ? "Hide" : "View"} {postComments.length} comment
              {postComments.length !== 1 ? "s" : ""}
              {openComments ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </button>
          ) : (
            <span className="text-gray-500">No comments yet</span>
          )}
        </div>

        {openComments && postComments.length > 0 && (
          <div className="mt-4 space-y-3">
            {postComments.map((c) => (
              <div
                key={c._id}
                className="flex gap-3 p-3 rounded-xl bg-seconday-shade/60"
              >
                <img
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  src={c?.postedBy?.pic}
                  alt=""
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary-shade">
                    {c?.postedBy?.username}
                  </p>
                  <p className="text-sm mt-0.5 break-words">{c?.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </footer>
    </article>
  );
};

Feed.propTypes = {
  feed: PropTypes.object.isRequired,
};

export default Feed;
