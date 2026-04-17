const Newsletter = require("../Schemas/newsletterSchema");

async function saveSubscriberModel(email) {
  // upsert so re-subscribing with same email just re-activates instead of erroring
  return Newsletter.findOneAndUpdate(
    { email },
    { email, isActive: true, subscribedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function getAllSubscribersModel() {
  return Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
}

async function deleteSubscriberModel(email) {
  return Newsletter.findOneAndDelete({ email });
}

async function countSubscribersModel() {
  return Newsletter.countDocuments({ isActive: true });
}

module.exports = {
  saveSubscriberModel,
  getAllSubscribersModel,
  deleteSubscriberModel,
  countSubscribersModel,
};
