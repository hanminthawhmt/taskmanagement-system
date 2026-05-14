const taskController = require("../controllers/controller");
const router = require("express").Router();

router.post("/", taskController.handleCreatingATask);
router.get("/", taskController.handleFindAllTasks);
router.get("/:id", taskController.handleFindATaskById);
router.put("/:id", taskController.handdleUpdateTask);
router.delete("/:id", taskController.handleDeleteATask);

module.exports = router;
