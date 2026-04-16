import Notification from "../models/notification.js";

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, channel, status } = req.query;
    const query = { user: req.user._id };
    if (type)    query.type    = type;
    if (channel) query.channel = channel;
    if (status)  query.status  = status;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, status: { $ne: "read" } }),
    ]);

    res.status(200).json({ success: true, count: notifications.length, total, unreadCount, page: Number(page), data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "read", readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error marking notification as read", error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, status: { $ne: "read" } },
      { status: "read", readAt: new Date() }
    );
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error marking notifications as read", error: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting notification", error: error.message });
  }
};