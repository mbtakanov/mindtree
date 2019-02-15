import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Node = new Schema({
    id: {
        type: mongoose.Types.ObjectId
    },
    label: {
        type: String
    },
    description: {
        type: String
    },
    x: {
        type: Number
    },
    y: {
        type: Number
    }
}, { collection : 'node' });

export default mongoose.model('Node', Node);
