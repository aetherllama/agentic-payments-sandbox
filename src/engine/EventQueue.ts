import type { SimulationEvent } from '../types'

export class EventQueue {
  private events: SimulationEvent[] = []
  private processedEvents: SimulationEvent[] = []

  addEvent(event: Omit<SimulationEvent, 'id' | 'processed'>): string {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newEvent: SimulationEvent = {
      ...event,
      id,
      processed: false,
    }

    this.events.push(newEvent)
    this.sortEvents()
    return id
  }

  addEvents(events: Omit<SimulationEvent, 'id' | 'processed'>[]): string[] {
    return events.map((event) => this.addEvent(event))
  }

  private sortEvents(): void {
    this.events.sort((a, b) => {
      if (a.scheduledTime !== b.scheduledTime) {
        return a.scheduledTime - b.scheduledTime
      }
      return b.priority - a.priority
    })
  }

  getNextEvent(currentTime: number): SimulationEvent | null {
    const readyEvents = this.events.filter(
      (e) => e.scheduledTime <= currentTime && !e.processed
    )
    return readyEvents[0] || null
  }

  getAllReadyEvents(currentTime: number): SimulationEvent[] {
    return this.events.filter(
      (e) => e.scheduledTime <= currentTime && !e.processed
    )
  }

  processEvent(id: string): SimulationEvent | null {
    const index = this.events.findIndex((e) => e.id === id)
    if (index === -1) return null

    const event = this.events[index]
    const processedEvent = { ...event, processed: true }

    this.events.splice(index, 1)
    this.processedEvents.push(processedEvent)

    return processedEvent
  }

  removeEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id)
    if (index === -1) return false

    this.events.splice(index, 1)
    return true
  }

  getPendingEvents(): SimulationEvent[] {
    return [...this.events]
  }

  getProcessedEvents(): SimulationEvent[] {
    return [...this.processedEvents]
  }

  getEventById(id: string): SimulationEvent | undefined {
    return this.events.find((e) => e.id === id) ||
           this.processedEvents.find((e) => e.id === id)
  }

  clear(): void {
    this.events = []
    this.processedEvents = []
  }

  reset(): void {
    this.events = []
    this.processedEvents = []
  }

  getStats(): { pending: number; processed: number } {
    return {
      pending: this.events.length,
      processed: this.processedEvents.length,
    }
  }
}
