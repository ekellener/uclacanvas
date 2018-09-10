# Canvas scheduler

* A simple script for scheduling dates and populating announcements of existing Canvas LMS courses.


## Configuration and Authorization
Running the script requires some credentials for authenticating with your organization's Canvas instance - an API key and the domain of your Canvas instance, as well as some operational settings. You can provide these credentials by setting the following environment variables accordingly:

Environment Variable             | Example                        | Description
---------------------------------|--------------------------------|---
`CANVAS_API_VERSION`             | `v1`                           | API version
`CANVAS_API_DOMAIN`              | `organisation.instructure.com` | Your organisation's Canvas domain
`CANVAS_API_KEY`                 | `secret`                       | Your API key


## Usage

Usage: node index.js [options] [command]

  Commands:
    help     Display help
    version  Display version

  Options:

    -f, --file     (REQUIRED) The json formatted file to process.
    -h, --help     Output usage information
    -p, --prod     Flag to perform updates, default is read only
    -v, --version  Output the version number




## JSON File format

definition of terms:
  
course - specification of encompassing LMS module
module - specification of a unit of learning
test - specification of test activity
quiz - specification of quiz activity
announce - specification of announcement broadcast
unlock - specification in (time) format using an offset format
(time) - object in hours & days to describe the time period.

  

The file is broken into 3 sections

 - config - Course Start date and existing Course ID
- defaults - The default date and duration offsets for modules, tests, quizzes and announcements. These are required to be populated.
- course -  The main container specifying dates/times for each module and the objects within the module

Note: 
The hierarchy of the object specification is as follows:

The config section is organized as:
- Course Start Date - Date when the Course is available (GMT)
- CourseID - Canvas LMS Course ID

The defaults section is organized as:
 - Organized similar to the course section below. The default section is used to have default unlock, duration and interval specifications for Modules, Tests, Quizzes, and Announcements.
 - 
![Image of Object scheduling](https://drive.google.com/open?id=1C5CAwRm2ciC1zcoTTw-S-4vvgQEWVAXX)

The course section is organized as:
 - Course
	 - Module
		 - searchName - Substring to match an existing module's name in the course.
		 - Override - [Optional]
			 - unlock - Object of the offset when the Module will be available.
			 - interval - Object of the time period of the 
		 - Test [Optional]
			 - searchName - Substring to match an existing Test's name in the course.
	 		 - Override - [Optional]
				 - unlock - Object of the offset when the Test will be available.
				 - duration - Object of the time period that the Test will be available.
		 - Quiz [Optional]
			 - searchName - Substring to match an existing Quiz's name in the course.
			 - Override - [Optional]
				 - unlock - Object of the offset when the Quiz will be available.
				 - duration - Object of the time period that the Quiz will be available.
		 - Announce [Optional] (Multiple announcement options)
		 -  - Override - [Optional]
				 - unlock - Object of the offset when the Announcement will be available.
			 - title - the subject title of the announcement
			 - message - the string of the announce message.
				



Refer to sample.json for an example of the file


