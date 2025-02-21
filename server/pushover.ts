import Push from "pushover-notifications";

const push = new Push({
  user: process.env["PUSHOVER_USER_KEY"],
  token: process.env["PUSHOVER_TOKEN"],
});

export const sendPushNotificationNewPlayerJoined = (name: string) => {
  if (push && process.env["PUSHOVER_ENABLE"]) {
    if (process.env["PUSHOVER_IGNORE"]) {
      const ignoreList =
        (JSON.parse(process.env["PUSHOVER_IGNORE"]) as string[]) || [];
      if (ignoreList.includes(name.toLowerCase().trim())) {
        return;
      }
    }

    console.log("Sending push notification for ", name);
    push.send({ message: "blobshooter: " + name + " just joined!" });
  }
};
