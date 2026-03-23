import axios from 'axios'

import { getBaseUrl } from './getBaseUrl'

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
