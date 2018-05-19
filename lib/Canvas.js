const moment = require("moment");
const canvas_api = require("../../canvas-api/index.js");
const _ = require('lodash');

/**
 * @param  {} config
 */
var Canvas = function () {
  this.api = canvas_api;
  this.readonly = true;
}

/**
 * @param  {} name
 * @param  {} unlockdate
 */
Canvas.prototype.updateModuleDate = async function (name, unlockdate) {
  let editParams = {
    module: {
      unlock_at: unlockdate
    }
  }
  let result;
  try {
    result = await this.api.cmodule.searchbyname(this.courseconfig.courseID, name);
    if (result.body.length == 0) throw Error("Problem searching for :", name);
  } catch (error) {
    console.log("name: "+name,error.stack);
    return;
  }

  console.log('(U)(M)(D)', name, result.body[0].id, "u:" + editParams.module.unlock_at.local().toString());
  if (!this.readonly) {
    try {
      result = await this.api.cmodule.edit(this.courseconfig.courseID, result.body[0].id, editParams)
      let val = await setTimeout(function () {
        console.log('wait')
      }, 2000);
    } catch (error) {
      console.log("name: "+name,error.stack);
    }
  }

}


/**
 * @param  {} name
 * @param  {} unlockdate
 * @param  {} duedate
 * @param  {} lockdate
 */

Canvas.prototype.createCourseAnnouncement = async function (title, message, unlockdate) {
  let editParams = {
    title: title,
    message: message,
    is_announcement: true,
    delayed_post_at: unlockdate
  }
  let result;

  console.log('Add Announcement:', title, message, unlockdate.local().toString());
  if (!this.readonly) {
    try {
      result = await this.api.course.discuss(this.courseconfig.courseID, editParams);
      let val = await setTimeout(function () {
        console.log('wait')
      }, 2000);
    } catch (error) {
      console.log("title: "+title,error.stack);
      return;
    }
  } else
    console.log("**Test mode**");
}


Canvas.prototype.updateTestDates = async function (name, unlockdate, duedate, lockdate) {
  let editParams = {
    assignment: {
      due_at: duedate,
      lock_at: duedate,
      unlock_at: unlockdate
    }
  }
  let result;
  try {
    result = await this.api.assignment.searchbyname(this.courseconfig.courseID, name);
    if (result.body.length == 0) throw Error("Problem searching for :" + name);
  } catch (error) {
    console.log("name: "+name,error.stack);
    return;
  }

  console.log('(U)(T)(D)', name, result.body[0].id, "u:" + editParams.assignment.unlock_at.local().toString(), " d:" + editParams.assignment.due_at.local().toString());
  if (!this.readonly) {
    try {
      result = await this.api.assignment.edit(this.courseconfig.courseID, result.body[0].id, editParams)
      let val = await setTimeout(function () {
        console.log('wait')
      }, 2000);
    } catch (error) {
      console.log("name: "+name,error.stack);
      return;
    }
  } else
    console.log("**Test mode**");

}


/**
 * @param  {} name
 * @param  {} unlockdate
 * @param  {} duedate
 * @param  {} lockdate
 */

Canvas.prototype.updateQuizDates = async function (name, unlockdate, duedate, lockdate) {
  let editParams = {
    assignment: {
      due_at: duedate,
      lock_at: duedate,
      unlock_at: unlockdate
    }
  }
  let result;
  try {
    result = await this.api.assignment.searchbyname(this.courseconfig.courseID, name);
    if (result.body.length == 0) throw Error("Problem searching for :", name);

  } catch (error) {
    console.log("name: "+name,error.stack);
    return;
  }

  console.log('(U)(Q)(D)', name, result.body[0].id, "u:" + editParams.assignment.unlock_at.local().toString(), " d:" + editParams.assignment.due_at.local().toString());
  if (!this.readonly) {
    try {
      result = await this.api.assignment.edit(this.courseconfig.courseID, result.body[0].id, editParams);
      let val = await setTimeout(function () {
        console.log('wait')
      }, 2000);
    } catch (error) {
      console.log("name: "+name,error.stack);
      return;
    }
  } else
    console.log("**Test mode**");

}
/**
 * @param  {} jsonConfig
 */

Canvas.prototype.updateCourseConfig = function (jsonConfig) {
  this.courselist = jsonConfig.course;
  this.courseconfig = jsonConfig.config;
  let defaults = jsonConfig.defaults;

  let rolModuleDate = moment(new Date(this.courseconfig.courseStartDate));

  //Loop through each Module in the CourseList
  this.courselist.forEach(element => {
    let rolUnlock_at = moment(rolModuleDate);
    let rolDue_at = moment(rolModuleDate);
    rolUnlock_at.add(defaults.module.unlock);
    rolDue_at = moment(rolUnlock_at).add(defaults.module.duration);

    // Module dates
    this.updateModuleDate(
      element.module.searchName,
      moment(rolModuleDate).add(_.get(element, 'module.override.unlock', defaults.module.unlock)));


    // Test assignments
    if (_.has(element, 'module.test')) {
      rolUnlock_at = moment(rolModuleDate).add(_.get(element, 'module.test.override.unlock', defaults.test.unlock));
      rolDue_at = moment(rolUnlock_at).add(_.get(element, 'module.test.override.duration', defaults.test.duration));
      this.updateTestDates(
        element.module.test.searchName,
        rolUnlock_at,
        rolDue_at,
        rolUnlock_at
      )
    };

    // Announcements
    if (_.has(element, 'module.announce')) {
      rolUnlock_at = moment(rolModuleDate).add(_.get(element, 'module.announce.override.unlock', defaults.announce.unlock));
      this.createCourseAnnouncement(
        element.module.announce.title,
        element.module.announce.message,
        rolUnlock_at
      );
    };

    // Quiz assignments

    if (_.has(element, 'module.quiz')) {
      rolUnlock_at = moment(rolModuleDate).add(_.get(element, 'module.quiz.override.unlock', defaults.quiz.unlock));
      rolDue_at = moment(rolUnlock_at).add(_.get(element, 'module.quiz.override.duration', defaults.quiz.duration));
      this.updateQuizDates(
        element.module.quiz.searchName,
        rolUnlock_at,
        rolDue_at,
        rolUnlock_at
      );
    };
    // Module default period is 7 days
    // TODO add to config file
    rolModuleDate.add({
      days: 7
    });
  }); // for each
} // UpdateCourse 


module.exports = Canvas