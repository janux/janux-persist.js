# Janux persistence.

The project `janux-persistence` help to provide auth services to a system. 

**Requirements**

This project has been tested with the following programs.

Node version 6.

Mongo db version 3.4


**Install**

After cloning the project you need to do `npm install` in order to install the dependencies.
 

**Compile**

To compile the project run `gulp`


**Test**

To test the project run `gulp test`

**Settings**

This project use the config project where some settings are defined. Por example,
 which mongo db uses the project. 
 
 There are 2 files inside the config directory.
 
 development.js
 
 test.js
 
 For example, when you execute `gulp test` , the system gets the settings from test.js. 
