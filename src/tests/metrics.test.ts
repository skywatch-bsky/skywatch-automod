import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { startMetricsServer } from '../metrics.js'
import { Server } from 'http'

describe('Metrics Server', () => {
  let server: Server

  afterEach(() => {
    if (server) {
      server.close()
    }
  })

  it('should return metrics on /metrics endpoint', async () => {
    server = startMetricsServer(0)
    const response = await request(server).get('/metrics')
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.text).toContain('process_cpu_user_seconds_total')
  })
})