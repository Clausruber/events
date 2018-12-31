function createTrigger() {
  ScriptApp.newTrigger('updateEvents')
      .timeBased()
      .everyMinutes(5)
      .create();
}

function updateEvents() {
  var sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1iAauperQNOH7VZJvyWCb2MR5iE5ktH-Zupw-pXyw7Jg/edit?usp=sharing").getSheetByName("Results") //Could be null
  var data = sheet.getDataRange().getValues()
  
  var events = []
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == "") {
      break
    }
    
    var speakerNotificationDate = new Date(data[i][4].getTime() + 2.88e7)
    if (data[i][5] != '') {
      speakerNotificationDate = new Date(data[i][5].getTime() + 2.88e7)
    }
    var event = {}
    event[data[0][0]] = data[i][0]
    event[data[0][1]] = data[i][1]
    event[data[0][2]] = data[i][2]
    event[data[0][3]] = data[i][3]
    event[data[0][4]] = new Date(data[i][4].getTime() + 2.88e7)
    event[data[0][5]] = speakerNotificationDate
    event[data[0][6]] = new Date(data[i][6].getTime() + 2.88e7)
    event[data[0][7]] = new Date(data[i][7].getTime() + 7.2e7)
    event[data[0][8]] = data[i][8]
    event[data[0][9]] = data[i][9]
    event[data[0][10]] = data[i][10]
    events.push(event)
  }
  
  var submittedCalendar = CalendarApp.getCalendarById("b3mn60nthfnkjlkagkfl60pvq4@group.calendar.google.com")
  var acceptedCalendar = CalendarApp.getCalendarById("8mlkhc11cjdl68nseouic603f0@group.calendar.google.com")
  
  for (var i = 0; i < events.length; i++) {
    if (events[i]["Accepted"] == "Yes") {
      if (typeof acceptedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - " + events[i]["Talks Accepted"]})[0] == 'undefined') {
        acceptedCalendar.createEvent(events[i]["Event Name"] + " - " + events[i]["Talks Accepted"], events[i]["Start date"], events[i]["End date"], {location: events[i]["Location"], description: "Event URL: " + events[i]["Event URL"] + "\n\nCFP URL: " + events[i]["CFP URL"] + "\n\nTalks Accepted: " + events[i]["Talks Accepted"]}).setColor(CalendarApp.EventColor.GREEN).addEmailReminder(40320).addPopupReminder(40320)
        Logger.log("Created accepted event on accepted calendar")
      }
      
      if (typeof submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Accepted"})[0] == 'undefined') {
        submittedCalendar.createEvent(events[i]["Event Name"] + " - Accepted", events[i]["Start date"], events[i]["End date"], {location: events[i]["Location"], description: "Event URL: " + events[i]["Event URL"] + "\n\nCFP URL: " + events[i]["CFP URL"] + "\n\nTalks Accepted: " + events[i]["Talks Accepted"]}).setColor(CalendarApp.EventColor.GREEN)
        Logger.log("Created accepted event on submitted calendar")
      }
      
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Submitted"})[0])
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Rejected"})[0])
    } else if (events[i]["Accepted"] == "No") {
      if (typeof submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Rejected"})[0] == 'undefined') {
        submittedCalendar.createEvent(events[i]["Event Name"] + " - Rejected", events[i]["Start date"], events[i]["End date"], {location: events[i]["Location"], description: "Event URL: " + events[i]["Event URL"] + "\n\nCFP URL: " + events[i]["CFP URL"] + "\n\nTalks Submitted: " + events[i]["Talks Submitted"]}).setColor(CalendarApp.EventColor.GRAY)
        Logger.log("Created rejected event")
      }
      
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Submitted"})[0])
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Accepted"})[0])
      deleteEvent(acceptedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - " + events[i]["Talks Accepted"]})[0])
    } else {
      if (typeof submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Submitted"})[0] == 'undefined') {
        submittedCalendar.createEvent(events[i]["Event Name"] + " - Submitted", events[i]["Start date"], events[i]["End date"], {location: events[i]["Location"], description: "CFP End Date: " + events[i]["CFP end date"] + "\n\nSpeaker Notification Date: " + events[i]["Speaker notification date"] + "\n\nEvent URL: " + events[i]["Event URL"] + "\n\nCFP URL: " + events[i]["CFP URL"] + "\n\nTalks Submitted: " + events[i]["Talks Submitted"]}).setColor(CalendarApp.EventColor.ORANGE).addEmailReminder(40320).addPopupReminder(40320)
        Logger.log("Created submitted event")
      }
      
      deleteEvent(acceptedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - " + events[i]["Talks Accepted"]})[0])
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Accepted"})[0])
      deleteEvent(submittedCalendar.getEvents(events[i]["Start date"], events[i]["End date"], {search: events[i]["Event Name"] + " - Rejected"})[0])
    }
    
    if (typeof submittedCalendar.getEvents(events[i]["CFP end date"], events[i]["Start date"], {search: events[i]["Event Name"] + " - CFP"})[0] == 'undefined') {
      submittedCalendar.createAllDayEvent(events[i]["Event Name"] + " - CFP", events[i]["CFP end date"], {location: events[i]["Location"], description: "CFP End Date: " + events[i]["CFP end date"] + "\n\nSpeaker Notification Date: " + events[i]["Speaker notification date"] + "\n\nEvent URL: " + events[i]["Event URL"] + "\n\nCFP URL: " + events[i]["CFP URL"] + "\n\nTalks Submitted: " + events[i]["Talks Submitted"]}).setColor(CalendarApp.EventColor.YELLOW).addEmailReminder(10080).addPopupReminder(10080)
      Logger.log("Created CFP event")
    }
  }
}

function deleteEvent(event) {
  if (typeof event != 'undefined') {
    Logger.log("Deleting event %s", event.getTitle())
    event.deleteEvent()
  }
}