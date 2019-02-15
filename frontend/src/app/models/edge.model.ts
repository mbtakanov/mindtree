export class Edge {
  constructor(from: string = '',
              to?: string,
              id?: string) {
    this.from = from;
  }

  id: string;
  from: string;
  to: string;
}
