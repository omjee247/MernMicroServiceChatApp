import express from 'express';
import { getAllUser, getUser, loginUser, updateName, verifyUser } from '../controllers/user.js';
import { isAuth, myProfile } from '../middleware/isAuth.js';
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUser);
router.get("/user/:id", getUser);
router.post("/update/user", isAuth, updateName);
export default router;
//# sourceMappingURL=user.js.map