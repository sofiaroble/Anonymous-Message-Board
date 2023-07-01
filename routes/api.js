'use strict';
const BoardModel = require("../models").Board;
const ThreadModel = require("../models").Thread;
const ReplyModel = require("../models").Reply;

module.exports = function (app) {
  
app.route('/api/threads/:board').post(async (req, res) => { 
  const { text, delete_password } = req.body;  
  let board = req.body.board;
  if(!board) {
    board = req.params.board;
  }
  console.log("post", req.body);
  const newThread = new ThreadModel({
    text: text,
    delete_password: delete_password,
    replies: [],
  });

  try {
    console.log("newThread", newThread);
    let boardData = await BoardModel.findOne({ name: board });

    if (!boardData) {
      const newBoard = new BoardModel({
        name: board,
        threads: [newThread],
      });

    let data = await newBoard.save();
    if (data) {
        res.json(newThread);
    } else {
      throw new Error("There was an error saving in post");
      }
    } else {
      boardData.threads.push(newThread);
      let data = await boardData.save();
      if (data) {
        res.json(newThread);
      } else {
        throw new Error("There was an error saving in post");
      }
    }
  } catch (err) {
    console.error(err);
    res.send("There was an error processing the request");
  }
})
 .get(async (req, res) => {
    const board = req.params.board;
    try {
      const boardData = await BoardModel.findOne({ name: board });
      if (!boardData) {
        console.log("No board with this name");
        res.status(404).json({ error: 'No board with this name' });
        return;
 }
    // Sort threads in descending order and limit to 10
    const threads = boardData.threads.sort((a, b) => b.created_on - a.created_on).slice(0, 10);
    
    // Prepare response data
    const responseData = threads.map((thread) => {
        const {
        _id,
        text,
        created_on,
        bumped_on,
        replies,
    } = thread;

    // Sort replies in descending order and limit to 3
    const sortedReplies = replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);

    // Exclude 'reported' and 'delete_password' fields from replies
    const cleanedReplies = sortedReplies.map(reply => {
      return {
        _id: reply._id,
        text: reply.text,
        created_on: reply.created_on,
    };
  });
      return {
        _id,
        text,
        created_on,
        bumped_on,
        replies: cleanedReplies,
        replycount: cleanedReplies.length,
    };
 });
res.json(responseData);
} catch(err) {
    console.error(err);
    res.status(500).json({ error: 'There was an error processing the request' 
 });
}
}).put(async (req, res) => {
    console.log("put", req.body);
    const { thread_id } = req.body; 
    const board = req.params.board;

    try {
        let boardData = await BoardModel.findOne({ name: board });
        if (!boardData) {
            res.json({error: "Board not found"});
            return;
        }
        
        const date = new Date();
        let reportedThread = boardData.threads.id(thread_id);  
        
        if (!reportedThread) {
            res.json({error: "Thread not found"});
            return;
        }
        
        reportedThread.reported = true;
        reportedThread.bumped_on = date;
        
        await boardData.save();
         res.send("reported");  
    
    } catch(err) {
        console.log(err);
        res.json({error: "There was an error processing the request"});
    }
 })
  .delete(async (req, res) => {
    const { thread_id, delete_password } = req.body;
    const board = req.params.board;

    try {
      const boardData = await BoardModel.findOne({ name: board });

      if (!boardData) {
        return res.json('Board not found');
      }

      const threadToDelete = boardData.threads.id(thread_id);
      
      if (!threadToDelete || threadToDelete.delete_password !== delete_password) {
        return res.send('incorrect password');
      }

      boardData.threads.pull({ _id: thread_id });
      boardData.markModified('threads');
      await boardData.save();

      res.send('success');
    } catch (err) {
      console.error(err);
      res.send('There was an error processing the request');
    }
  });

 app.route('/api/replies/:board')
  .post(async (req, res) => {
    const { thread_id, text, delete_password } = req.body;
    console.log('thread_id:', thread_id);  
    let board = req.params.board;
    const created_on = new Date();
    let newReply = new ReplyModel({
      text: text,
      delete_password: delete_password,
      created_on: created_on,
      reported: false
    });

    try {
      let boardData = await BoardModel.findOne({ name: board });
      console.log('boardData', boardData);
      if (!boardData) {
        console.log('Board not found:', board);  
        return res.status(400).json({ error: "Board not found" });
      } else {
        const threadToUpdate = boardData.threads.id(thread_id);
        console.log('threadToUpdate', threadToUpdate);
        if (!threadToUpdate) {
          console.log('Thread not found in board:', thread_id, board); 
          return res.status(400).json({ error: "Thread not found" });
        }
        threadToUpdate.replies.push(newReply);
        threadToUpdate.bumped_on = created_on;
        let updatedBoardData = await boardData.save();
        return res.json(updatedBoardData);
      }
    } catch (err) {
       console.error('Error caught:', err);
      return res.status(500).send("There was an error processing the request");
    }
})
 .get(async (req, res) => {
  const board = req.params.board;
  const thread_id = req.query.thread_id;
  console.log('Requested thread_id:', thread_id);
  
  try {
    const boardModel = await BoardModel.findOne({ name: board });
    if (!boardModel) {
      console.log("No board with this name");
      res.status(404).json({ error: 'No board with this name' });
      return;
    }

    let thread = boardModel.threads.id(thread_id);
    if (!thread) {
      console.log("No thread with this id");
      res.status(404).json({ error: 'No thread with this id' });
      return;
    }
        
  // Exclude 'reported' and 'delete_password' fields from the thread
        let threadResponse = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(reply => {
           return {
             _id: reply._id,
             text: reply.text,
             created_on: reply.created_on,
           };
         })
        };
        
     res.json(threadResponse);
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'There was an error processing the request' });
    }
})

  .put(async (req, res) => {
    const { thread_id, reply_id } = req.body;
    const board = req.params.board;

    try {
      const boardData = await BoardModel.findOne({ name: board });

      if (!boardData) {
        return res.send('incorrect password');
      }

      const threadToUpdate = boardData.threads.id(thread_id);
      
      if (!threadToUpdate) {
        return res.send('incorrect password');
      }

      const replyToReport = threadToUpdate.replies.id(reply_id);
      
      if (!replyToReport) {
        return res.send('incorrect password');
      }

      replyToReport.reported = true;

      boardData.markModified('threads');
      await boardData.save();

      res.send('reported');
    } catch (err) {
      console.error(err);
      res.send('There was an error processing the request');
    }
  })
  .delete(async (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;
    const board = req.params.board;

    try {
      const boardData = await BoardModel.findOne({ name: board });

      if (!boardData) {
        return res.send('incorrect password');
      }

      const threadToUpdate = boardData.threads.id(thread_id);
      
      if (!threadToUpdate) {
        return res.send('incorrect password');
      }

      const replyToDelete = threadToUpdate.replies.id(reply_id);
      
      if (!replyToDelete || replyToDelete.delete_password !== delete_password) {
        return res.send('incorrect password');
      }

      replyToDelete.text = '[deleted]'; 

      boardData.markModified('threads');
      await boardData.save();

      res.send('success');
    } catch (err) {
      console.error(err);
      res.send('There was an error processing the request');
    }
  });
};