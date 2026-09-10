var NotificationSocket = require('../WebSockets/NotificationSocket');

const BaseControllerHelper = require('../helper/BaseControllerHelper');

class NotificationHelper {
  SaveNotification = async function ({ Data, LogedUser, SendNotification }) {
    try {
      if (Data && LogedUser && Data.ToUserId) {
        const NotificationId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'Notification',
          Data,
          LogedUser,
        });
        if (NotificationId) {
          // var NotificationData = await Notification.findAllNew({
          //   where: { Id: NotificationId },
          // });
          if (SendNotification === true) {
            NotificationSocket.SendNotification({
              UserId: Data.ToUserId,
              Data: NotificationId,
            });
          }
          return NotificationId;
        }
        return null;
      }
    } catch (ex) {
      console.log(ex);
      return false;
    }
  };
}

module.exports = new NotificationHelper();
