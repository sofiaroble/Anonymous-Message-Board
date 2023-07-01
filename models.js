const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReplySchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: false },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
});
const Reply = mongoose.model("Reply", ReplySchema);

const ThreadSchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: false },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: { type: [ReplySchema] }, 
});
const Thread = mongoose.model("Thread", ThreadSchema);

const BoardSchema = new Schema({
  name: { type: String, required: true },
  threads: { type: [ThreadSchema] },
});

const Board = mongoose.model("Board", BoardSchema);

exports.Board = Board;
exports.Thread = Thread;
exports.Reply = Reply;
