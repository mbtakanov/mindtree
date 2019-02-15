export class Node {
  constructor(id: string = '', label: string = '', description: string = '', x: number = 0, y: number = 0) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.x = x;
    this.y = y;
  }

  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}
