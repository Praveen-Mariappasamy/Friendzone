import { useContext, useState } from "react";
import { MyContext } from "../../context/MyContext";
import { AiOutlineSend, AiOutlineClose } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi2";
import { InputFile } from "../index";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import uploadImage from "../../utils/uploadImage";
import { API_BASE } from "../../constants/api";

const PostContainer = () => {
  const { loggedUser, setFetchPostAgain, setChatContext } =
    useContext(MyContext);

  const [showSupportBanner, setShowSupportBanner] = useState(false);
  const [supportReason, setSupportReason] = useState("");
  const [caption, setCaption] = useState("");
  const [img, setImg] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const toast = useToast();

  const clearImage = () => {
    setImg("");
    setImgPreview("");
  };

  const imgUpload = async (pic) => {
    if (!pic) return;

    setUploading(true);
    try {
      const url = await uploadImage(pic);
      setImg(url);
      setImgPreview(url);
      toast({
        title: "Image ready to post",
        status: "success",
        duration: 1800,
        position: "top",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.error || error.message || "Upload failed",
        status: "error",
        duration: 2500,
        position: "top",
      });
    } finally {
      setUploading(false);
    }
  };

  const analyzePostWithAI = async (text) => {
    if (!text?.trim()) return;

    try {
      const { data } = await axios.post(
        `${API_BASE}/chat/analyze-post`,
        { text },
        { withCredentials: true }
      );

      if (data.needsSupport) {
        setShowSupportBanner(true);
        setSupportReason(data.reason || "");
        setChatContext({
          mode: "support",
          postText: text,
          username: loggedUser?.username,
        });
      } else {
        setShowSupportBanner(false);
      }
    } catch (error) {
      console.error("Post analysis error:", error.message);
    }
  };

  const createPost = async () => {
    if (!caption.trim() && !img) {
      toast({
        title: "Add a caption or image to post",
        status: "warning",
        duration: 2000,
        position: "top",
      });
      return;
    }

    const textToAnalyze = caption;
    setShowSupportBanner(false);
    setSupportReason("");
    setPosting(true);

    try {
      await axios.post(
        `${API_BASE}/post/create-post`,
        { caption, img },
        { withCredentials: true }
      );

      setCaption("");
      clearImage();
      setFetchPostAgain((prev) => !prev);

      toast({
        title: "Posted successfully",
        status: "success",
        duration: 1800,
        position: "top",
      });

      await analyzePostWithAI(textToAnalyze);
    } catch (error) {
      toast({
        title: error.response?.data?.error || "Failed to create post",
        status: "error",
        duration: 2500,
        position: "top",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!posting && !uploading) createPost();
    }
  };

  const isBusy = posting || uploading;

  return (
    <div className="card w-full my-4 overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <img
          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-shade/30 shrink-0"
          src={loggedUser?.pic}
          alt={loggedUser?.username}
        />
        <div className="flex-1 min-w-0">
          <textarea
            rows={2}
            className="input-field w-full resize-none min-h-[72px]"
            placeholder={`What's on your mind, ${loggedUser?.username}?`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={posting}
          />

          {imgPreview && (
            <div className="relative mt-3 inline-block">
              <img
                src={imgPreview}
                alt="Preview"
                className="max-h-52 rounded-xl object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                aria-label="Remove image"
              >
                <AiOutlineClose className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-shade cursor-pointer transition">
              <BiImageAdd className="w-5 h-5" />
              {uploading ? "Uploading..." : "Add photo"}
              <InputFile
                id="postPhoto"
                name="postPhoto"
                onChange={(e) => imgUpload(e.target.files[0])}
              />
            </label>

            <button
              type="button"
              onClick={createPost}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-full bg-primary-shade hover:bg-sky-400 text-white px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? "Posting..." : "Post"}
              {!posting && <AiOutlineSend className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {showSupportBanner && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-900/80 to-purple-900/60 border border-indigo-400/30">
          <div className="flex items-start gap-3">
            <HiSparkles className="w-6 h-6 text-indigo-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">
                We noticed you might be going through a tough time.
              </p>
              {supportReason && (
                <p className="text-indigo-200/80 text-sm mt-1">{supportReason}</p>
              )}
              <p className="text-gray-300 text-sm mt-2">
                Our AI assistant is ready to listen with your post as context.{" "}
                <Link
                  to="/chatbot"
                  className="text-primary-shade font-semibold underline underline-offset-2 hover:text-sky-300"
                >
                  Talk to the assistant
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContainer;
