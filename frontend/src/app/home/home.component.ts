import { Component, OnInit } from '@angular/core';
import { Network, DataSet, IdType } from 'vis';
import { DataService } from '../services/data.service';
import { MindTree } from '../models/mind-tree.model';
import { Node } from '../models/node.model';
import { Edge } from '../models/edge.model';
import {NodeResponse} from '../models/node-response.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  network: any;
  nodesData: Node[];
  edgesData: Edge[];
  nodes: DataSet;
  edges: DataSet;

  // allNodes: any[];
  // allEdges: any[];
  newNode: Node;
  newEdge: Edge;
  selectableNodes: Node[];
  selectableNodesToRemove: Node[];
  selectedParentNode: Node;
  editNode: Node;
  editNodeNewParent: Node;
  editNodeParentToRemove: Node;
  editEdge: Edge;


  constructor(private dataService: DataService) {
    this.nodesData = [];
    this.edgesData = [];
    this.selectableNodes = [];
    this.selectableNodesToRemove = [];

    this.nodes = new DataSet(this.nodesData);
    this.edges = new DataSet(this.edgesData);

    this.newNode = new Node();
    this.newEdge = new Edge();
    this.selectedParentNode = new Node();
    this.editNode = new Node();
    this.editNodeNewParent = new Node();
    this.editNodeParentToRemove = new Node();
    this.editEdge = new Edge();
  }

  ngOnInit() {
    this.getNodes();
  }

  initNetwork() {
    const container = document.getElementById('visualization');
    const options = {
      layout: {
        // hierarchical: {
          // nodeSpacing: 300,
          // direction: 'UD',
          // sortMethod: 'directed'
        // }
      },
      interaction: {
        dragNodes: true
      },
      nodes: {
        size: 10,
        widthConstraint: {
          minimum: 50,
          maximum: 300
        },
        shape: 'box',
        color: {
          background: '#333333',
          highlight: {
            background: '#444444'
          }
        },
        // labelHighlightBold: false,
        font: {
          size: 20, // Default. Changing this will result in wrong display dimensions of the nodes.
          color: 'white',
        }
      },
      physics: false,
      manipulation: { }
    };
    this.nodes = new DataSet(this.nodesData);
    this.edges = new DataSet(this.edgesData);
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    this.network = new Network(container, data, options);

    // this.allEdges = this.edges.get({returnType: 'Object'});
    const that = this;
    this.network.on('click', this.nodeLeftClick.bind(this));
    this.network.on('oncontext', function(params) {
      const nodeIndex = this.getNodeAt(params.pointer.DOM);
      that.nodeRightClick(nodeIndex);
    });
  }

  getNodes() {
    this.dataService.getNodes().subscribe((data: MindTree) => {
      this.nodesData = data.nodes;
      this.edgesData = data.edges;

      this.nodes = new DataSet(this.nodesData);
      this.edges = new DataSet(this.edgesData);
      this.initNetwork();

      this.getSelectableNodes();
    });
  }

  addNode() {
    if (this.newEdge.from) {
      // Creating child node
      this.dataService.addChild(this.newNode, this.newEdge).subscribe((response: NodeResponse) => {
        this.addVisNodeAfterResponse(response);
        this.addVisEdgeAfterResponse(response);
        this.getSelectableNodes();
        this.selectedParentNode = new Node();
        // this.initNetwork();
      });
    } else {
      // Creating parent node
      this.dataService.addParent(this.newNode).subscribe((response: NodeResponse) => {
        this.addVisNodeAfterResponse(response);
        this.getSelectableNodes();
        this.selectedParentNode = new Node();
        // this.initNetwork();
      });
    }
  }

  editNode_() {
    // TODO: Change the logic when adding a parent node to a child node. New edge is created and some edges are deleted.
    // this.editEdge = new Edge(this.editNode.id);
    this.dataService.editNode(this.editNode, this.editNodeNewParent.id, this.editNodeParentToRemove.id).subscribe(response => {

      // this.nodesData = this.nodesData.map(node => {
      //   if (node.id === this.editNode.id) {
      //     node.label = this.editNode.label;
      //     node.description = this.editNode.description;
      //   }
      //
      //   return node;
      // });
      //
      // this.edgesData = this.edgesData.map(edge => {
      //   if (edge.id === this.editEdge.id) {
      //     edge.from = this.editEdge.from;
      //     edge.to = this.editEdge.to;
      //   }
      //
      //   return edge;
      // });

      // TODO: This should be replaced with an update method. The built-in update method doesn't work properly.
      this.initNetwork();
    });
  }

  deleteNode() {
    this.dataService.deleteNode(this.editNode).subscribe(response => {
      console.log(response);
    });
  }

  getSelectableNodes() {
    this.selectableNodes = this.nodesData.map(node => new Node(node.id, node.label));
  }

  selectParentNode(node) {
    this.selectedParentNode = node;
    this.newEdge.from = node.id;
  }

  selectEditNodeNewParent(node) {
    this.editNodeNewParent = node;
  }

  selectEditNodeParentToRemove(node) {
    this.editNodeParentToRemove = node;
  }

  addVisNodeAfterResponse(response: NodeResponse) {
    this.newNode.id = response.nodeId;
    this.nodesData.push(this.newNode);
    this.nodes.add(this.newNode);
    this.newNode = new Node();
  }

  addVisEdgeAfterResponse(response: NodeResponse) {
    this.newEdge.to = response.nodeId;
    this.newEdge.id = response.edgeId;
    this.edgesData.push(this.newEdge);
    this.edges.add(this.newEdge);
    this.newEdge = new Edge();
  }

  isAddNewParentDisabled(node) {
    // TODO: finish this function
    // node.id === editNode.id || node.id === editEdge.from
    return false;
  }
  nodeLeftClick(params) {
    if (params.nodes.length > 0) {
      const nodeIndex = params.nodes[0];
      const allNodes = this.nodes.get({returnType: 'Object'});
      const node = allNodes[nodeIndex];
      this.selectParentNode(node);

      this.editNode = node;
      this.edgesData.forEach(edge => {
        if (edge.to === this.editNode.id) {
          this.editEdge = edge; // In order to disable some nodes when selecting new parent

          this.nodesData.forEach(n => {
            if (n.id === edge.from) {
              this.selectableNodesToRemove.push(n);
            }
          });
        }
      });

      // this.nodesData.forEach(n => {
      //   if (n.id === node.id) {
      //     this.editNodeNewParent = n;
      //   }
      // });
    }
  }

  nodeRightClick(nodeIndex) {
    const allNodes = this.nodes.get({returnType: 'Object'});
    this.network.selectNodes([nodeIndex]);
    this.selectParentNode(allNodes[nodeIndex]);
  }

  deselectParentNode() {
    this.selectedParentNode = new Node();
    this.newEdge = new Edge();
  }

  calculateNodesXAndY() {
    const xStep = 300; // We have 300 units between two nodes at the x axis.
    const yStep = 150; // We have 100 units between two nodes at the y axis.

    this.nodesData.forEach(node => {
      const edgesFromCurrentNode = this.edgesData.filter(edge => edge.from === node.id);

      if (edgesFromCurrentNode.length) {
        const childNodes = this.nodesData.filter(n => {
          return edgesFromCurrentNode.find(e => {
            return e.to === n.id;
          });
        });
        const areChildNodesOddNumber = childNodes.length % 2 !== 0;
        const middle = childNodes.length / 2;

        childNodes.forEach((childNode, index) => {
          childNode.y = node.y + yStep;

          if (areChildNodesOddNumber) {
            const oddMiddle = Math.ceil(middle);

            if ((index + 1) < oddMiddle) {
              // Current node is on the left side of the middle. Ex: 5 elements and current index is 0. 3 is the middle.
              childNode.x = node.x + (((oddMiddle - 1) - index) * xStep * -1);
            } else if ((index + 1) === oddMiddle) {
              childNode.x = node.x;
              // Current node is bellow the middle. Ex: 5 elements and current index is 2. 3 is the middle.
            } else {
              // Current node is on the right side of the middle. Ex: 5 elements and current index is 3. 3 is the middle.
              childNode.x = node.x + (((index + 1) - oddMiddle) * xStep);
            }
          } else {
            if ((index + 1) <= middle) {
              // Current node is on the left side of the middle. Ex: 4 elements and current index is 0. 2 on the left and 2 on the right.
              childNode.x = node.x + 150 + ((middle - index) * xStep * -1);
            } else if ((index + 1) > middle) {
              // Current node is on the right side of the middle. Ex: 4 elements and current index is 3. 2 on the left and 2 on the right.
              childNode.x = node.x - 150 + (((index + 1) - middle) * xStep);
            }
          }
        });
      }
    });
  }

}
