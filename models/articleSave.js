var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
 
  id: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  
  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },

  note: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ]
});

var articleSave = mongoose.model("articleSave", articleSaveSchema);

module.exports = articleSave;