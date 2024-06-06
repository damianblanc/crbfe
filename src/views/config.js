import axios from 'axios';

// const isLocalhost = window.location.hostname === 'localhost';
// const localhostUrl = 'http://localhost:8098';
// const localIpUrl = 'https://all-rats-smell.loca.lt';

// const BASE_URL = isLocalhost ? localhostUrl : localIpUrl;

// export default BASE_URL;

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL_HOST,
});

export default api;