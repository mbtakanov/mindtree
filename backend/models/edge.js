import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Edge = new Schema({
    id: {
        type: mongoose.Types.ObjectId
    },
    from: {
        type: String
    },
    to: {
        type: String
    }
}, { collection : 'edge' });

export default mongoose.model('Edge', Edge);
