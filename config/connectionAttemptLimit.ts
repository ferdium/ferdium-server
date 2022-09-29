type ConnectionAttemptLimit = {
  maxAttempts: number,
  periodInHours: number,
}

const connectionAttemptLimit: ConnectionAttemptLimit = {
  maxAttempts: 5,
  periodInHours: 5,
}

export default connectionAttemptLimit
