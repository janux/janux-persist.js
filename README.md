# Janux persistence.

The project `janux-persistence` help to provide auth services to a system. 

**Requirements**

This project has been tested with the following programs.

Tested with node version 6.11.0 (this project does not work with node 4.4.x).

The mongodb implementations are for version mongodb version 3.4.


**Install**

Before installing the dependencies. Make sure there is a reference of the project janux-people in the  "vendor" directory. In a \*nix system:

  $ mkdir vendor
  $ cd vendor
  $ ln -s [path-to]/janux-people.js

After cloning the project you need to do `npm install` in order to install the dependencies.
 

**Clean**

To clean the build fies (compiled files and bundles)  run `npm run clean`.

**Compile**

To compile the project fies run `npm run compile`.

**Test**

To test the project run `npm run test`. You need a mongodb database enabled.

**Typedoc**

To generate the doc files run `npm run doc`

**Build**

To build the project run `npm run build`. This command does the following.

1 Clean the build directories.

2 Compile the files.

3 Create the documentation using typedoc.

4 Bundle the dependencies using webpack.

**Settings**

This project uses the node-config project where some settings are defined. Por example,
which mongo db uses the project. 
 
 There are 2 files inside the config directory.
 
 development.js
 
 test.js
 
 For example, when you execute `npm run test`, the system gets the settings from test.js. 
 
**Extra tasks**
 
running `npm run generateUsers` generated sample user data in a lokijs or mongodb database (based on the info retrieved from config).


**Using this project in another node project**

Before using this project with another node project you need to do `npm run build` before running `npm install` in the client project.

This has not been tested exhaustively in all scenarios, but you can do the following.

1.- Using this project in a node project using only es5.
 
Add the dependency to package.json

You can, for example, has a reference like the following example. All code in the "lib" directory is es5 ready.
    
    var DaoFactory=require('janux-persistence/lib').DaoFactory;
    
2.- Using this project in a node project using es6.
    
Add the dependency to package.json.

You can use the dependencies exactly as the step 1. However, this project also has the libraries compiled with es6. You can use the es6 libraries in the directory "lib-esm".

    var DaoFactory=require('janux-persistence/lib-esm').DaoFactory;
    
Last but not least. For pure node typescript projects, both "lib" and "lib-esm" works. Both directories has typescript definition files.
    
**Using this project in another browser project**

_This feature is in very early stages, does not work, and most likely the information here is going to change substantially._

For browser projects that uses typescript or es6 (babel). In theory you just need to add the janux-persistence project and link the references ( just like the previous examples). 

For browser projects that are stuck with es5. You can't use the libraries in "lib" or "lib-esm" because this code is not browser ready. You need to use the bundle file.
     
     <script src="janux-persistence/_bundles/my-lib.min.js"></script>  
     
     or
       
     <script src="janux-persistence/_bundles/my-lib.js"></script>  
