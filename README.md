# Janux persistence.

The project `janux-persistence` help to provide auth services to a system. 

**Requirements**

This project has been tested with the following programs.

Node version 4.4.3 (it can work with node version 6).

Gulp installed globally.

Mongo db version 3.4


**Install**

Before installing the dependencies. Make sure there is a reference of the project janux-people in the  "vendor" directory.

After cloning the project you need to do `npm install` in order to install the dependencies.
 

**Compile**

To compile the project run `gulp`


**Test**

To test the project run `gulp test`

**Typedoc**

To generate the doc files run `gulp doc` 

**Settings**

This project use the config project where some settings are defined. Por example,
 which mongo db uses the project. 
 
 There are 2 files inside the config directory.
 
 development.js
 
 test.js
 
 For example, when you execute `gulp test` , the system gets the settings from test.js. 
 
 **Extra tasks**
 
 running `npm run generateUsers` generated sample user data in a lokijs or mongodb database (based on the info retrieved from config).
