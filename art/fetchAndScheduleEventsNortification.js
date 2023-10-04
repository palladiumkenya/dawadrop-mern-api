const schedule = require("node-schedule");
const ARTDistributionEvent = require("./models/ARTDistributionEvent");
const { sendSms } = require("../patients/api");
const { parseMessage } = require("../utils/helpers");
const config = require("config");
const SmsConfig = require("../core/models/SmsConfig");
const moment = require("moment/moment");
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
          from: "patients",
          foreignField: "_id",
          localField: "subscriptions.patient",
          as: "patientSubscribers",
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "group.lead.user",
          as: "leadUser",
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "patientSubscribers.user",
          as: "subscribers",
        },
      },
      { $addFields: { extraSubscribers: "$group.extraSubscribers" } },
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

    // console.log(events);

    events.forEach((event) => {
      event.remiderNortificationDates.forEach((date) => {
        const reminderDate = new Date(date);

        // Schedule the task to run at the specified reminder date
        const job = schedule.scheduleJob(reminderDate, async function () {
          try {
            const eventDetails = {
              event_title: event.title,
              event_group: event.group.title,
              event_time: moment(event.distributionTime).format(
                "ddd MMM Do  yyyy HH:mm"
              ),
              event_venue: event.distributionLocation.address,
              event_remarks: event.remarks,
              event_organizer: event.leadUser[0]?.phoneNumber,
            };

            const template =
              (
                await SmsConfig.findOne({
                  smsType: "EVENT_REMINDER",
                })
              )?.smsTemplate || config.get("sms.EVENT_REMINDER");

            // Send nortification to all event subscribers
            for (const subscriber of event.subscribers) {
              const { username, phoneNumber, firstName } = subscriber;
              console.log("Sending sms to ....", username, phoneNumber);
              const name = firstName || username;
              await sendSms(
                parseMessage(
                  {
                    ...eventDetails,
                    name,
                  },
                  template
                ),
                phoneNumber
              );
            }
            // send nortification to extra subscribers
            for (const subscriber of event.extraSubscribers) {
              const { name, phoneNumber } = subscriber;
              console.log("Sending sms to ....", name, phoneNumber);
              await sendSms(
                parseMessage({ ...eventDetails, name }, template),
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
