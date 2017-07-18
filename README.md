# Janux persistence.

The project `janux-persistence` help to provide auth services to a system. 

**Requirements**

This project has been tested with the following programs.

Node version 4.4.3 (it can work with node version 6).

Mongo db version 3.4


**Install**

Before installing the dependencies. Make sure there is a reference of the project janux-people in the  "vendor" directory. In a \*nix system:

  $ mkdir vendor
  $ cd vendor
  $ ln -s [path-to]/janux-people.js

After cloning the project you need to do `npm install` in order to install the dependencies.`npm install` will automatically run `gulp` after installing the dependencies and to an initial build of the project by invoking the default gulp target.
 

**Compile**

To compile the project run `gulp`. To see the other tasks available: `gulp -T`.


**Test**

To test the project run `gulp test`

**Settings**

This project uses the node-config project where some settings are defined. Por example,
which mongo db uses the project. 
 
 There are 2 files inside the config directory.
 
 development.js
 
 test.js
 
 For example, when you execute `gulp test`, the system gets the settings from test.js. 
 
**Extra tasks**
 
running `npm run generateUsers` generated sample user data in a lokijs or mongodb database (based on the info retrieved from config).
