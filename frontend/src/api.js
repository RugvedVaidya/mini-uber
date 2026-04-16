import axios from 'axios'

const GATEWAY = 'http://localhost:8080'
const token = () => localStorage.getItem('token')

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` }
})

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => axios.post(`${GATEWAY}/api/auth/register`, data),
  login: (data) => axios.post(`${GATEWAY}/api/auth/login`, data),
}

export const bookingApi = {
  requestRide: (data) => axios.post(`${GATEWAY}/api/rides/request`, data, authHeaders()),
  acceptRide: (id) => axios.put(`${GATEWAY}/api/rides/${id}/accept`, {}, authHeaders()),
  startRide: (id) => axios.put(`${GATEWAY}/api/rides/${id}/start`, {}, authHeaders()),
  completeRide: (id) => axios.put(`${GATEWAY}/api/rides/${id}/complete`, {}, authHeaders()),
  cancelRide: (id) => axios.put(`${GATEWAY}/api/rides/${id}/cancel`, {}, authHeaders()),
  myRides: () => axios.get(`${GATEWAY}/api/rides/my-rides`, authHeaders()),
  getRide: (id) => axios.get(`${GATEWAY}/api/rides/${id}`, authHeaders()),
  pendingRides: () => axios.get(`${GATEWAY}/api/rides/pending`, authHeaders()),
}

export const paymentApi = {
  initiate: (data) => axios.post(`${GATEWAY}/api/payments/initiate`, data, authHeaders()),
  process: (id) => axios.post(`${GATEWAY}/api/payments/${id}/process`, {}, authHeaders()),
  getByRide: (rideId) => axios.get(`${GATEWAY}/api/payments/ride/${rideId}`, authHeaders()),
}

export const locationApi = {
  update: (data) => axios.post(`${GATEWAY}/api/location/update`, data, authHeaders()),
  getDriver: (driverId) => axios.get(`${GATEWAY}/api/location/driver/${driverId}`, authHeaders()),
  getNearby: (lat, lng, radius = 5) =>
    axios.get(`${GATEWAY}/api/location/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, authHeaders()),
  setAvailable: (driverId, available) =>
    axios.post(`${GATEWAY}/api/location/driver/${driverId}/available?available=${available}`, {}, authHeaders()),
}