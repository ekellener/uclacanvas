
const moment = require('moment');
const canvas_api = require('canvas-api');
const get = require('lodash').get;
const has = require('lodash').has;

/**
 * @param  {} config
 */
class Canvas {
  constructor() {
    this.api = canvas_api;
    this.readonly = true;
  }
  /**
   * @param  {} name
   * @param  {} unlockdate
   */
  async updateModuleDate(name, unlockdate) {
    let editParams = {
      module: {
        unlock_at: unlockdate
      }
    };
    let result;
    try {
      result = await this.api.cmodule.searchbyname(this.courseconfig.courseID, name);
      if (result.body.length == 0)
        throw Error("Problem searching for :", name);
    }
    catch (error) {
      console.log("name: " + name, error.stack);
      return;
    }
    console.log('(U)(M)(D)', name, result.body[0].id, "u:" + editParams.module.unlock_at.local().toString());
    if (!this.readonly) {
      try {
        result = this.api.cmodule.edit(this.courseconfig.courseID, result.body[0].id, editParams);
      }
      catch (error) {
        console.log("name: " + name, error.stack);
      }
    }
  }
  /**
   * @param  {} name
   * @param  {} unlockdate
   * @param  {} duedate
   * @param  {} lockdate
   */
createCourseAnnouncement(title, message, unlockdate) {
    let editParams = {
      title: title,
      message: message,
      is_announcement: true,
      delayed_post_at: unlockdate
    };
    let result;
    console.log('Add Announcement:', title, message, unlockdate.local().toString());
    if (!this.readonly) {
      try {
      this.api.course.discuss(this.courseconfig.courseID, editParams);
        }
      catch (error) {
        console.log("title: " + title, error.stack);
        return;
      }
    }
    else
      console.log("**Test mode**");
  }
async updateTestDates(name, unlockdate, duedate, lockdate) {
    let editParams = {
      quiz: {
        show_correct_answers: true,
        show_correct_answers_at: duedate,
        due_at: duedate,
        lock_at: duedate,
        unlock_at: unlockdate
      }
    };
    // Updating Test Dates assumes the need to also update when Test answers will be displayed and requires and update to the quiz show_correct_answers_at date
    let result;
    try {
     result = await this.api.quiz.searchbyname(this.courseconfig.courseID, name);
      if (result.body.length == 0)
        throw Error("Problem searching for :" + name);
    }
    catch (error) {
      console.log("name: " + name, error.stack);
      return;
    }
    console.log('(U)(T)(D)', name, result.body[0].id, "u:" + editParams.quiz.unlock_at.local().toString(), " d:" + editParams.quiz.due_at.local().toString());
    if (!this.readonly) {
      try {
        this.api.quiz.edit(this.courseconfig.courseID, result.body[0].id, editParams);
      }
      catch (error) {
        console.log("name: " + name, error.stack);
        return;
      }
    }
    else
      console.log("**Test mode**");
  }
  /**
   * @param  {} name
   * @param  {} unlockdate
   * @param  {} duedate
   * @param  {} lockdate
   */
async updateQuizDates(name, unlockdate, duedate, lockdate) {
    let editParams = {
      assignment: {
        due_at: duedate,
        lock_at: duedate,
        unlock_at: unlockdate
      }
    };
    // Updating Quiz dates Dates uses the default settings, and displays Quiz answers when Quiz is submited
    let result;
    try {
      result = await this.api.assignment.searchbyname(this.courseconfig.courseID, name);
      if (result.body.length == 0)
        throw Error("Problem searching for :", name);
    }
    catch (error) {
      console.log("name: " + name, error.stack);
      return;
    }
    console.log('(U)(Q)(D)', name, result.body[0].id, "u:" + editParams.assignment.unlock_at.local().toString(), " d:" + editParams.assignment.due_at.local().toString());
    if (!this.readonly) {
      try {   
       this.api.assignment.edit(this.courseconfig.courseID, result.body[0].id, editParams);
      }
      catch (error) {
        console.log("name: " + name, error.stack);
        return;
      }
    }
    else
      console.log("**Test mode**");
  }
  /**
   * @param  {} jsonConfig
   */
  async updateCourseConfig(jsonConfig) {
    this.courselist = jsonConfig.course;
    this.courseconfig = jsonConfig.config;
    let defaults = jsonConfig.defaults;
    let rolModuleDate = moment(new Date(this.courseconfig.courseStartDate));
    let result,val;
    // Define blocking delay;
    const delay = time => new Promise(res=>setTimeout(res,time));
    //Loop through each Module in the CourseList

    for (const element of this.courselist) {
      let rolUnlock_at = moment(rolModuleDate);
      let rolDue_at = moment(rolModuleDate);
      rolUnlock_at.add(defaults.module.unlock);

      result = await this.updateModuleDate(element.module.searchName, moment(rolModuleDate).add(get(element, 'module.override.unlock', defaults.module.unlock)));

    
      // Modules
      //Put in a sleep timer to prevent API rate limiter
      await delay(1000);
      
      // Test assignments single test per module
      if (has(element, 'module.test')) {
        rolUnlock_at = moment(rolModuleDate).add(get(element, 'module.test.override.unlock', defaults.test.unlock));
        rolDue_at = moment(rolUnlock_at).add(get(element, 'module.test.override.duration', defaults.test.duration));
        result = await  this.updateTestDates(element.module.test.searchName, rolUnlock_at, rolDue_at, rolUnlock_at);
      }
      // Announcements - Now enables multiple announcements per module
      if (has(element, 'module.announce')) {
        for (const e of element.module.announce) {
          rolUnlock_at = moment(rolModuleDate).add(get(e, 'override.unlock', defaults.announce.unlock));
          result = await this.createCourseAnnouncement(e.title, e.message, rolUnlock_at);
        };
      }
      ;
      // Quiz assignment - single quiz per module
      if (has(element, 'module.quiz')) {
        rolUnlock_at = moment(rolModuleDate).add(get(element, 'module.quiz.override.unlock', defaults.quiz.unlock));
        rolDue_at = moment(rolUnlock_at).add(get(element, 'module.quiz.override.duration', defaults.quiz.duration));
        result = await this.updateQuizDates(element.module.quiz.searchName, rolUnlock_at, rolDue_at, rolUnlock_at);
      }
      ;
     // Increment by default interval for modules, unless there's an override
      rolModuleDate.add(get(element, 'module.override.interval', defaults.module.interval));

    }; // for each
  }
}



module.exports = Canvas;
 
