export class Queue<T> {
  list: T[];
  flushCount: number;

  constructor(flushCount = 5) {
    this.list = [];
    this.flushCount = flushCount;
  }

  enqueue(item: T) {
    this.list.push(item);
  }

  dequeue() {
    this.list.shift();
  }

  shift(all?: boolean) {
    return this.list.splice(0, all ? this.list.length : this.flushCount);
  }

  canFlush() {
    return this.list.length >= this.flushCount;
  }
}
