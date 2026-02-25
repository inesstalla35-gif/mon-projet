const cron = require("node-cron");
const User = require("../model/user_model");
const Notification = require("../model/notificationModel");
const notificationService = require("../services/notificationservice");

cron.schedule("0 18 * * *", async () => {
  // Tous les jours à 18h
  const users = await User.find({ notificationsEnabled: true });

  for (const user of users) {
    const alerts = await notificationService.checkUserNotifications(user._id);

    for (const alert of alerts) {
      await Notification.create({
        user: user._id,
        message: alert.message,
        type: alert.type,
      });

      //  Ici plus tard :
      // envoyer push notification / email
    }
  }
});
