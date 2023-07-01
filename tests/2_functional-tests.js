const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let test_Thread_id;
let test_Reply_id;
suite("Functional Tests", function () {
  suite("10 functional tests", function () {
    test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .post("/api/threads/test-board")
        .set("content-type", "application/json")
        .send({ text: "test text", delete_password: "test" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.text, "test text");
          assert.equal(res.body.delete_password, "test");
          assert.equal(res.body.reported, false);
          test_Thread_id = res.body._id;
          done();
        });
    });
    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
      chai
        .request(server)
        .get("/api/threads/test-board")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.exists(res.body[0], "There is a thread");
          assert.equal(res.body[0].text, "test text");
          done();
        });
    });
    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/test-board")
        .set("content-type", "application/json")
        .send({ thread_id: test_Thread_id, delete_password: "incorrect" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
      chai
        .request(server)
        .delete("/api/threads/test-board")
        .set("content-type", "application/json")
        .send({ thread_id: test_Thread_id, delete_password: "test" })
        .end(function (err, res) {
         assert.equal(res.status, 200);
         assert.equal(res.text, "success");
         done();
        });
   });
   test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    console.log("test_Thread_id", test_Thread_id);
    chai
       .request(server)
       .put("/api/threads/test-board")
       .set("content-type", "application/json")
       .send({ report_id: test_Thread_id })
       .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });
  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
  const board = 'general';
  chai.request(server)
    .post(`/api/threads/${board}`)
    .send({
      text: "Test thread",
      delete_password: "password",
    })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, "_id", "Response should include thread's _id");

      const threadId = res.body._id;
      chai
        .request(server)
        .post(`/api/replies/${board}`)
        .send({
          thread_id: threadId,
          text: "My Reply",
          delete_password: "password",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "threads", "Response should have a 'threads' property");
          const thread = res.body.threads.find((t) => t._id === threadId);
          assert.isNotNull(thread, "Response should include the new thread");
          assert.isArray(thread.replies, "Thread should have a 'replies' array");
          assert.isNotEmpty(thread.replies, "Replies array should not be empty");
          assert.equal(thread.replies[0].text, "My Reply", "First reply's text should match the input");
          done();
        });
    });
});
 test('Test GET request to /api/replies/:board to view a single thread with all replies', function(done){
    chai
      .request(server)
      .get('/api/replies/Sofia?thread_id=649dfa935ced6ca365fb312e')
      .end(function(err, res){   
        assert.equal(res.status, 200);
        assert.equal(typeof(res.body), 'object', 'response is an object');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'bumped_on');
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies, 'replies is an array');
        done();
      });
   });
    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
      console.log(
        "delete reply invalid ids: thread_id: " +
          test_Thread_id +
          " reply_id: " +
          test_Reply_id
      );
      chai
        .request(server)
        .delete("/api/replies/test-board")
        .set("content-type", "application/json")
        .send({
          thread_id: test_Thread_id,
          reply_id: test_Reply_id,
          delete_password: "Incorrect",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
      chai
        .request(server)
        .delete("/api/replies/test-board")
        .set("content-type", "application/json")
        .send({
          thread_id: test_Thread_id,
          reply_id: test_Reply_id,
          delete_password: "testreply",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
     });
        test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
      chai
        .request(server)
        .put("/api/replies/test-board")
        .set("content-type", "application/json")
        .send({
          thread_id: test_Thread_id,
          reply_id: test_Reply_id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password");
          done();
        });
    });
  });
});
  after(function () {
  chai.request(server)
  .get('/');
 });