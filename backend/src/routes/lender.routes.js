import { Router } from "express";
import { getMarketplace, placeBid, getMyBids,getWalletDetails } from "../controllers/lender.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { lenderKycVerification } from "../controllers/kyc.controller.js";

const router = Router();

// 1. Dashboard (Feed)
router.get("/marketplace", protect, authorize("lender"), getMarketplace);

// 4. KYC
router.post("/kyc-verification", protect, authorize("lender"), lenderKycVerification);

// 2. Place a Bid
router.post("/bid/:invoiceId", protect, authorize("lender"), placeBid);

// 3. Get My Bids (For LenderBidsPage)
router.get("/my-bids", protect, authorize("lender"), getMyBids);


router.get("/wallet", protect, authorize("lender"), getWalletDetails);

export default router;