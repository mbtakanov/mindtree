import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Node } from '../models/node.model';
import { Edge } from '../models/edge.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getNodes() {
    return this.http.get(`${environment.baseURL}/nodes`);
  }

  addNodeWithoutEdge(node: Node) {
    return this.http.post(`${environment.baseURL}/nodes/add/parent`, node);
  }

  addNodeWithEdge(node: Node, edge: Edge) {
    return this.http.post(`${environment.baseURL}/nodes/add/child`, { node: node, edge: edge });
  }

  editNode(node: Node, nodeNewParentId: string, nodeParentToRemoveId: string) {
    return this.http.put(`${environment.baseURL}/nodes/update`, {
      node: node,
      nodeNewParentId: nodeNewParentId,
      nodeParentToRemoveId: nodeParentToRemoveId
    });
  }

  deleteNode(node: Node) {
    return this.http.delete(`${environment.baseURL}/nodes/delete/${node.id}`);
  }

  savePositions(nodes: Node) {
    return this.http.put(`${environment.baseURL}/nodes/update/positions`, nodes);
  }
}
