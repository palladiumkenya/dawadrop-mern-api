const ARTDistributionGroupLead = require("../art/models/ARTDistributionGroupLead");

const isGroupLead = async (req, res, next) => {
  // must follow auth middleware
  if (!req.user) {
    return res.status(401).json({ detail: "Access Denied.No token Provided" });
  }
  const userId = req.user._id;
  const lead = await ARTDistributionGroupLead.findOne({ user: userId });
  if (!lead) {
    return res.status(403).json({
      detail: "Forbidden! You must be a group lead to access this resource",
    });
  }
  next();
};

module.exports = isGroupLead;
