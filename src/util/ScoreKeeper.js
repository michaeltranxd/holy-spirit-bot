const Discord = require("discord.js");
const { everyone_channel } = require("../config.json");
const fs = require("fs");

const ranking_places = [
  ":first_place: ",
  ":second_place: ",
  ":third_place: ",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

// True of str1 > str2, false otherwise
function compareTimeString(str1, str2) {
  let time1 = timeStringToInt(str1);
  let time2 = timeStringToInt(str2);

  if (time1 < time2) return -1;
  else if (time1 > time2) return 1;
  else return 0;
}

// Convert timestring to amount of seconds
function timeStringToInt(timeString) {
  let timeArray = timeString.split(":");
  // First index is hr, second index is min, third index is second

  let hr = parseInt(timeArray[0]) * 60 * 60;
  let min = parseInt(timeArray[1]) * 60;
  let sec = parseInt(timeArray[2]);
  return hr + min + sec;
}

function intToTimeString(timeNumber) {
  let hr = Math.floor((timeNumber / 60 / 60) % 24);
  let min = Math.floor((timeNumber / 60) % 60);
  let sec = Math.floor(timeNumber % 60);

  let hrString = `${hr}`;
  let minString = `${min}`;
  let secString = `${sec}`;

  if (hr < 10) hrString = `0${hrString}`;
  if (min < 10) minString = `0${minString}`;
  if (sec < 10) secString = `0${secString}`;
  return `${hrString}:${minString}:${secString}`;
}

// Return hh:mm:ss
function getFormattedTimeString(timeString) {
  return intToTimeString(timeStringToInt(timeString));
}

function getTotalTimeString(times) {
  let total = 0;
  times.forEach((elem) => {
    total += timeStringToInt(elem);
  });
  return intToTimeString(total);
}

function countFinishedLegs(finishedLegs) {
  let count = 0;
  finishedLegs.forEach((elem) => {
    if (elem) count++;
  });
  return count;
}

class ScoreKeeper {
  _dois;

  // Initalize with file TODO
  constructor() {
    this._dois = new Discord.Collection();

    try {
      let str = fs.readFileSync("./util/doi_list.json", {
        encoding: "utf8",
        flag: "r",
      });

      let json = JSON.parse(str);

      let dois = Object.values(json);
      dois.forEach((doi) => {
        this._dois.set(doi.id, doi);
      });
    } catch (error) {
      console.log("Reading from file was bad...");
    }
  }

  getLeaderboardForLeg(message, legNumber) {
    let dois = this._dois.array();

    if (dois.length === 0) {
      return message.reply(`Please wait until the HT have added the teams...`);
    }

    // Sort by smallest time
    dois.sort((a, b) => {
      // Take care of if one of the particpants hasn't finished
      if (!a.finishedLegs[legNumber - 1] && !b.finishedLegs[legNumber - 1])
        return 0;
      else if (!a.finishedLegs[legNumber - 1]) return 1;
      else if (!b.finishedLegs[legNumber - 1]) return -1;

      return compareTimeString(a.times[legNumber - 1], b.times[legNumber - 1]);
    });

    // Generate embed message

    let doiNames = "";
    let doiTimes = "";
    let doiRankings = "";

    let prevDoi = dois[0];
    let rankDoiIndex = 0;

    dois.forEach((doi, index) => {
      let prevOverallTimeA = getTotalTimeString(prevDoi.times);
      let currOverallTimeB = getTotalTimeString(doi.times);

      doiNames += `${doi.name}\n`;
      doiTimes += `${doi.times[legNumber - 1]}\n`;

      // If they have same times then we give them same ranks
      if (compareTimeString(prevOverallTimeA, currOverallTimeB) === 0) {
        // Same ranks
      } else {
        // Different ranks
        rankDoiIndex++;
      }
      doiRankings += `(${ranking_places[rankDoiIndex]})\n`;

      prevDoi = doi;
    });

    // Create embed for it
    const embeddedMessage = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .addFields(
        {
          name: `++++++++++Leg ${legNumber} Leaderboard++++++++++`,
          value: `\u200B`,
        },
        { name: "Ranking", value: doiRankings, inline: true },
        { name: "Đội/Team", value: doiNames, inline: true },
        { name: "Times (hh:mm:ss)", value: `${doiTimes}\u200B`, inline: true }
      );

    return embeddedMessage;
  }

  getLeaderboardOverall(message) {
    let dois = this._dois.array();

    if (dois.length === 0) {
      return message.reply(`Please wait until the HT have added the teams...`);
    }

    // Sort by smallest time
    dois.sort((a, b) => {
      // Take care of if completed multiple legs vs those that haven't
      let legsCompletedByA = countFinishedLegs(a.finishedLegs);
      let legsCompletedByB = countFinishedLegs(b.finishedLegs);

      if (legsCompletedByA > legsCompletedByB) return -1;
      else if (legsCompletedByA < legsCompletedByB) return 1;

      // At this point they have the same legs completed
      // Add the times together and then compare the times
      let overallTimeA = getTotalTimeString(a.times);
      let overallTimeB = getTotalTimeString(b.times);

      return compareTimeString(overallTimeA, overallTimeB);
    });

    // Generate embed message

    let doiNames = "";
    let doiStats = "";
    let doiLegsFinished = "";

    let prevDoi = dois[0];
    let rankDoiIndex = 0;

    dois.forEach((doi, index) => {
      let prevLegsCompleted = countFinishedLegs(prevDoi.finishedLegs);
      let currLegsCompleted = countFinishedLegs(doi.finishedLegs);

      let prevOverallTimeA = getTotalTimeString(prevDoi.times);
      let currOverallTimeB = getTotalTimeString(doi.times);

      doiNames += `${doi.name}\n`;
      doiLegsFinished += `${countFinishedLegs(doi.finishedLegs)}\n`;

      // If they have same times then we give them same ranks
      if (
        prevLegsCompleted === currLegsCompleted &&
        compareTimeString(prevOverallTimeA, currOverallTimeB) === 0
      ) {
        // Same ranks
      } else {
        // Different ranks
        rankDoiIndex++;
      }

      doiStats += `(${ranking_places[rankDoiIndex]}) [${getTotalTimeString(
        doi.times
      )}]\n`;

      prevDoi = doi;
    });

    // Create embed for it
    const embeddedMessage = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .addFields(
        {
          name: `++++++++++Overall Leaderboard++++++++++`,
          value: `\u200B`,
        },
        { name: "Rank + Time", value: doiStats, inline: true },
        { name: "Đội/Team", value: doiNames, inline: true },
        { name: "Legs finished", value: doiLegsFinished, inline: true }
      );

    return embeddedMessage;
  }

  addDoi(message, doiRole) {
    if (this._dois.get(doiRole.id)) {
      return message.reply(`Error: That Đội has already been added.`);
    }

    // 3 Legs
    this._dois.set(doiRole.id, {
      name: doiRole.name,
      id: doiRole.id,
      finishedLegs: [false, false, false],
      times: ["00:00:00", "00:00:00", "00:00:00"],
    });

    return message.reply(`Đội ${doiRole.name} has been added to the list`);
  }

  removeDoi(message, doiRole) {
    if (!this._dois.get(doiRole.id)) {
      return message.reply(`Error: That Đội does not exist in the list`);
    }

    this._dois.delete(doiRole.id);

    return message.reply(`Đội ${doiRole.name} has been removed from the list`);
  }

  finishDoi(message, doiRole, legNum, timeString) {
    if (!this._dois.get(doiRole.id)) {
      return message.reply(
        `Error: That Đội hasn't been added to the list yet. Please add it using the add command`
      );
    }

    let doiInfo = this._dois.get(doiRole.id);
    doiInfo.finishedLegs[legNum - 1] = true;
    doiInfo.times[legNum - 1] = getFormattedTimeString(timeString);

    message.guild.channels.cache
      .get(everyone_channel)
      .send(
        `Đội ${doiInfo.name} has finished leg ${legNum} with the time of ${
          doiInfo.times[legNum - 1]
        }`
      )
      .then((msg) => {
        msg.channel.send(this.getLeaderboardForLeg(message, legNum));
      });

    return message.reply(
      `Đội ${doiInfo.name} finish command executed with time ${
        doiInfo.times[legNum - 1]
      }`
    );
  }

  unfinishDoi(message, doiRole, legNum) {
    if (!this._dois.get(doiRole.id)) {
      return message.reply(
        `Error: That Đội hasn't been added to the list yet. Please add it using the add command`
      );
    }

    let doiInfo = this._dois.get(doiRole.id);
    doiInfo.finishedLegs[legNum - 1] = false;
    doiInfo.times[legNum - 1] = getFormattedTimeString("00:00:00");

    return message.reply(`Đội ${doiInfo.name} resetted time for leg ${legNum}`);
  }

  listDoi(message) {
    let allDoiIDs = this._dois.keyArray();

    if (allDoiIDs.length === 0) {
      return message.reply(
        `Error: No Đội have been added to the list yet. Please add it using the add command`
      );
    }
    let result = " here are the lists of the Đội added to the list:\n";
    this._dois.keyArray().forEach((doiID) => {
      result += "<@&" + doiID + ">\n";
    });
    message.reply(result);
  }

  saveDoi() {
    let doiJSON = JSON.stringify(this._dois);

    fs.writeFileSync("./util/doi_list.json", doiJSON, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  unfinishAllLeg(message, legNum) {
    let doiList = this._dois.array();

    if (doiList.length === 0) {
      return message.reply(
        `Error: There are no Đội to unfinish. Please add it using the add command`
      );
    }

    doiList.forEach((doi) => {
      doi.finishedLegs[legNum - 1] = false;
      doi.times[legNum - 1] = getFormattedTimeString("00:00:00");
    });

    return message.reply(`All Đội has been resetted time for leg ${legNum}`);
  }

  unfinishAll(message) {
    let doiList = this._dois.array();

    if (doiList.length === 0) {
      return message.reply(
        `Error: There are no Đội to unfinish. Please add it using the add command`
      );
    }

    doiList.forEach((doi) => {
      // 3 legs
      for (let i = 0; i < 3; i++) {
        doi.finishedLegs[i] = false;
        doi.times[i] = getFormattedTimeString("00:00:00");
      }
    });

    return message.reply(`All Đội has been resetted time for all legs`);
  }

  removeAll(message) {
    let doiList = this._dois.array();

    if (doiList.length === 0) {
      return message.reply(
        `Error: There are no Đội to remove. Please add it using the add command`
      );
    }

    doiList.forEach((doi) => {
      this._dois.delete(doi.id);
    });

    return message.reply(`All Đội has been removed`);
  }
}

module.exports = ScoreKeeper;
