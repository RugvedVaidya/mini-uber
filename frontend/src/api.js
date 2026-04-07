import axios from 'axios'

const token = () => localStorage.getItem('token')

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` }
})

export const authApi = {
  register: (data) => axios.post('http://localhost:8081/api/auth/register', data),
  login: (data) => axios.post('http://localhost:8081/api/auth/login', data),
}

export const bookingApi = {
  requestRide: (data) => axios.post('http://localhost:8082/api/rides/request', data, authHeaders()),
  acceptRide: (id) => axios.put(`http://localhost:8082/api/rides/${id}/accept`, {}, authHeaders()),
  startRide: (id) => axios.put(`http://localhost:8082/api/rides/${id}/start`, {}, authHeaders()),
  completeRide: (id) => axios.put(`http://localhost:8082/api/rides/${id}/complete`, {}, authHeaders()),
  myRides: () => axios.get('http://localhost:8082/api/rides/my-rides', authHeaders()),
  getRide: (id) => axios.get(`http://localhost:8082/api/rides/${id}`, authHeaders()),
  pendingRides: () => axios.get('http://localhost:8082/api/rides/pending', authHeaders()),
}

export const paymentApi = {
  initiate: (data) => axios.post('http://localhost:8084/api/payments/initiate', data, authHeaders()),
  process: (id) => axios.post(`http://localhost:8084/api/payments/${id}/process`, {}, authHeaders()),
  getByRide: (rideId) => axios.get(`http://localhost:8084/api/payments/ride/${rideId}`, authHeaders()),
}

export const locationApi = {
  update: (data) => axios.post('http://localhost:8083/api/location/update', data, authHeaders()),
  getDriver: (driverId) => axios.get(`http://localhost:8083/api/location/driver/${driverId}`, authHeaders()),
}