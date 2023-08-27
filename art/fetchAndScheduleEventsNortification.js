const schedule = require("node-schedule");
const ARTDistributionEvent = require("./models/ARTDistributionEvent");
const { sendSms } = require("../patients/api");

async function fetchAndScheduleEventsNortification() {
  try {
    const currentDate = new Date();
    const events = await ARTDistributionEvent.aggregate([
      {
        $match: {
          distributionTime: { $gte: currentDate }, //Only upcoming events
          remiderNortificationDates: { $elemMatch: { $gte: currentDate } }, // only future dates
        },
      },
      {
        $lookup: {
          from: "artdistributiongroupenrollments",
          foreignField: "group._id",
          localField: "group._id",
          as: "subscriptions",
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "subscriptions.user",
          as: "subscribers",
        },
      },
      {
        $project: {
          subscriptions: 0,
          subscribers: {
            password: 0,
            __v: 0,
            isActive: 0,
            roles: 0,
            isSuperUser: 0,
            lastLogin: 0,
          },
        },
      },
    ]); // Fetch events from the database

    console.log(events);

    events.forEach((event) => {
      event.remiderNortificationDates.forEach((date) => {
        const reminderDate = new Date(date);

        // Schedule the task to run at the specified reminder date
        const job = schedule.scheduleJob(reminderDate, async function () {
          try {
            console.log(`Sending reminder for event: ${event.title}`);
            // Send nortification to all event subscribers
            for (const subscriber of event.subscribers) {
              const { username, email, phoneNumber, firstName, lastName } =
                subscriber;
              const name = firstName || username;
              await sendSms(
                `Dear ${name}, this message is to remind you of the forth comming event ${event.title} scheduled for ${event.distributionTime} at ${event.distributionLocation.address}`,
                phoneNumber
              );
            }
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        });
      });
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

module.exports = fetchAndScheduleEventsNortification;
