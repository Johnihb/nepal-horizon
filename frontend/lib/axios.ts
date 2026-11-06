import axios from "axios";

// axios.defaults.baseURL = "http://localhost:5000/api/v1"


const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
})

export default instance;