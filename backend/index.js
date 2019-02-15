import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Node from './models/node';
import Edge from './models/edge';

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mindtree');

const connection = mongoose.connection;

connection.once('open', () => {
   console.log('MongoDB database connection established successfully!');
});

router.route('/nodes').get((req, res) => {
   let response = {
      nodes: [],
      edges: []
   };

   Node.find((err, nodes) => {
      if (err) {
         res.status(400).json({'status': 'An error occurred.', error: err});
      } else if (!nodes) {
         res.status(404).json({'status': 'Failed to find nodes.', error: err});
      } else {
         response.nodes = nodes;
      }
   }).then(result => {
      Edge.find((err, edges) => {
         if (err) {
            res.status(400).json({'status': 'An error occurred.', error: err});
         } else if (!edges) {
            res.status(404).json({'status': 'Failed to find edges.', error: err});
         } else {
            response.edges = edges;
            res.status(200).json(response);
         }
      });
   });
});

router.route('/nodes/add/parent').post((req, res) => {
   let newNode = new Node(req.body);
   newNode.id = new mongoose.Types.ObjectId();
   newNode.save().then(node => {
      res.status(200).json({'nodeId': node.id});
   }).catch(err => {
      res.status(400).json({'status': 'Failed to create new record.'});
   });
});

router.route('/nodes/add/child').post((req, res) => {
   let newNode = new Node(req.body.node);
   newNode.id = new mongoose.Types.ObjectId();
   newNode.save().then(node => {
      let newEdge = new Edge(req.body.edge);
      newEdge.id = new mongoose.Types.ObjectId();
      newEdge.to = node.id;
      newEdge.save().then(edge => {
         res.status(200).json({'nodeId': node.id, 'edgeId': edge.id});
      }).catch(err => {
         res.status(400).json({'status': 'Failed to create new record.'});
      });
   }).catch(err => {
      res.status(400).json({'status': 'Failed to create new record.'});
   });
});

router.route('/nodes/update').put((req, res) => {
   Node.findOne({id: req.body.node.id}, (err, node) => {
      if (err) {
         res.status(400).json({'status': 'An error occurred.', error: err});
      } else if (!node) {
         res.status(404).json({'status': `Could't find node with id: ${req.body.node.id}`});
      } else {
         node.label = req.body.node.label;
         node.description = req.body.node.description;

         node.save().then(node => {
            if (req.body.nodeNewParentId) {
               let edge = new Edge();
               edge.id = new mongoose.Types.ObjectId();
               edge.from = req.body.nodeNewParentId;
               edge.to = node.id;
               edge.save().then(edge => {
                  res.status(200).json({'status': 'Update complete successfully. New parent created.'});
               });
            }

            if (req.body.nodeParentToRemoveId) {
               Edge.findOne({id: req.body.nodeParentToRemoveId}, (err, edge) => {
                  if (err) {
                     res.status(400).json({'status': 'An error occurred.', error: err});
                  } else if (!edge) {
                     res.status(404).json({'status': `Could't find edge with id: ${req.body.nodeParentToRemoveId}`});
                  } else {
                     edge.remove(() => {
                        res.status(200).json({'status': 'Update complete successfully. Parent removed.'});
                     });
                  }
               });
            }

            res.status(200).json({'status': 'Update complete successfully.'});
         }).catch(err => {
            res.status(400).json({'status': 'An error occurred.', error: err});
         });
      }
   });
});

router.route('/nodes/delete/:id').delete((req, res) => {
   Node.findOne({id: req.params.id}, (err, node) => {
      if (err) {
         res.status(400).json({'status': 'An error occurred.', error: err});
      } else if (!node) {
         res.status(404).json({'status': `Could't find node with id: ${req.params.id}`});
      } else {
         node.remove(() => {
            Edge.find({from: node.id}, (err, edges) => {
               if (edges.length) {
                  edges.forEach(edge => {
                     edge.remove();
                  });
                  res.status(200).json({'status': 'Node deleted successfully.'});
               } else {
                  res.status(200).json({'status': 'Node deleted successfully.'});
               }
            });
         });
      }
   });
});

app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));
