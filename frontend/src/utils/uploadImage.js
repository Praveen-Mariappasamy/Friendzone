import axios from "axios";
import { API_BASE } from "../constants/api";

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error("No file selected");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a PNG or JPEG image");
  }

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(`${API_BASE}/upload/image`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.url;
};

export default uploadImage;
