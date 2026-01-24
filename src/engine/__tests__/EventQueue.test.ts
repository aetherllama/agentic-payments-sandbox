import { describe, it, expect, beforeEach } from 'vitest'
import { EventQueue } from '../EventQueue'

describe('EventQueue', () => {
  let queue: EventQueue

  beforeEach(() => {
    queue = new EventQueue()
  })

  it('should add events to the queue', () => {
    const eventId = queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 5,
      payload: { test: true },
    })

    expect(eventId).toBeTruthy()
    expect(queue.getPendingEvents()).toHaveLength(1)
  })

  it('should sort events by scheduled time', () => {
    queue.addEvent({
      scheduledTime: 3000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    queue.addEvent({
      scheduledTime: 2000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    const events = queue.getPendingEvents()
    expect(events[0].scheduledTime).toBe(1000)
    expect(events[1].scheduledTime).toBe(2000)
    expect(events[2].scheduledTime).toBe(3000)
  })

  it('should sort by priority when times are equal', () => {
    queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 3,
      payload: { name: 'low' },
    })

    queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 10,
      payload: { name: 'high' },
    })

    const events = queue.getPendingEvents()
    expect((events[0].payload as any).name).toBe('high')
    expect((events[1].payload as any).name).toBe('low')
  })

  it('should get next event based on current time', () => {
    queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    queue.addEvent({
      scheduledTime: 2000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    expect(queue.getNextEvent(500)).toBeNull()
    expect(queue.getNextEvent(1000)).toBeTruthy()
    expect(queue.getNextEvent(1500)?.scheduledTime).toBe(1000)
  })

  it('should process events', () => {
    const eventId = queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    const processed = queue.processEvent(eventId)

    expect(processed).toBeTruthy()
    expect(processed?.processed).toBe(true)
    expect(queue.getPendingEvents()).toHaveLength(0)
    expect(queue.getProcessedEvents()).toHaveLength(1)
  })

  it('should remove events', () => {
    const eventId = queue.addEvent({
      scheduledTime: 1000,
      type: 'agent_action',
      priority: 5,
      payload: {},
    })

    const removed = queue.removeEvent(eventId)

    expect(removed).toBe(true)
    expect(queue.getPendingEvents()).toHaveLength(0)
  })

  it('should clear all events', () => {
    queue.addEvent({ scheduledTime: 1000, type: 'agent_action', priority: 5, payload: {} })
    queue.addEvent({ scheduledTime: 2000, type: 'agent_action', priority: 5, payload: {} })

    queue.clear()

    expect(queue.getPendingEvents()).toHaveLength(0)
    expect(queue.getProcessedEvents()).toHaveLength(0)
  })

  it('should return stats', () => {
    queue.addEvent({ scheduledTime: 1000, type: 'agent_action', priority: 5, payload: {} })
    queue.addEvent({ scheduledTime: 2000, type: 'agent_action', priority: 5, payload: {} })

    const event = queue.getNextEvent(1000)
    if (event) queue.processEvent(event.id)

    const stats = queue.getStats()
    expect(stats.pending).toBe(1)
    expect(stats.processed).toBe(1)
  })
})
