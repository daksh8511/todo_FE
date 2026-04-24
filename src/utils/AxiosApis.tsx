import axios from "axios";

const AxiosApi = async ({ endpoint, method = "GET", data = null, params = null, headers = {} }) => {
  try {
    const response = await axios({
      url: `https://todo-be-jvho.onrender.com${endpoint}`,
      method,
      data,     // for POST/PUT
      params,   // for query params
      headers,
    });

    return response;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export default AxiosApi;