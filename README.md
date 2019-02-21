## MindTree

MongoDB 4.0.5

Express 4.16.4

Angular 7

Node.js 10.13.0


## Usage and installation

First you'll need to create `mindtree` database. After that create `nodes` and `edges` collection in MongoDB.

#### Development 

In the `frontend` folder run the following commands:

```
npm install
npm run dev
```

This will start the frontend and will watch for changes.

In the `backend` folder run the following commands:

```
npm install
npm run dev
```

This will start the node server, connect to MongoDB and watch for changes.


#### Production

In the `frontend` folder run the following commands:

```
npm install
npm run build-prod
```

This will install node modules and will create `dist` folder which will be ready to be served.


In the `backend` folder run the following commands:

```
npm install
npm start
```

This will install node modules and will create `dist` folder which will be served by node.
