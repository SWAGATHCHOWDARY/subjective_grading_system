const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: {
            type: String,
            enum: ['text', 'pdf', 'image'],
            required: true
        },
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
            required: function () {
                return this.type === 'pdf' || this.type === 'image';
            }
        },
        fileName: {
            type: String,
            required: function () {
                return this.type === 'pdf' || this.type === 'image';
            }
        }
    },
    grade: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    reason: {
        type: String,
        required: true
    },
    isTeacher: {
        type: Boolean,
        default: false
    },
    idNo: {
        type: String,
        required: true
    }
});


const Question = mongoose.model('Question', questionSchema,'grades');


module.exports = Question;