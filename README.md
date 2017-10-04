# Janux persistence.

The project `janux-persistence` help to provide auth services to a system. 

**Requirements**

This project has been tested with the following programs.

Node version 4.4.3 (it can work with node version 6).

Gulp installed globally.

Mongo db version 3.4


**Install**

Before installing the dependencies. Make sure there is a reference of the project janux-people in the  "vendor" directory. In a \*nix system:

  $ mkdir vendor
  $ cd vendor
  $ ln -s [path-to]/janux-people.js

After cloning the project you need to do `npm install` in order to install the dependencies.`npm install` will automatically run `gulp` after installing the dependencies and to an initial build of the project by invoking the default gulp target.
 

**Compile**

To compile the project run `gulp`. To see the other tasks available: `gulp -T`.

**Debugging**

You can run `gulp compile-test`. This command generates the sourcemap inside the javascript files.

**Test**

To test the project run `gulp test`

**Typedoc**

To generate the doc files run `gulp doc` 

**Settings**

This project uses the node-config project where some settings are defined. Por example,
which mongo db uses the project. 
 
 There are 2 files inside the config directory.
 
 development.js
 
 test.js
 
 For example, when you execute `gulp test`, the system gets the settings from test.js. 
 
**Extra tasks**
 
running `npm run generateUsers` generated sample user data in a lokijs or mongodb database (based on the info retrieved from config).

**How to use janux-persist inside another project.**

If you want to use janux-persist inside another project you need to do the following.

1.. Make sure janux-persist is cloned and installed correctly

2.. Run `gulp` to make sure the compiled files are generated.

3.. Insert the dependency inside the package.json to the project you want to use janux-persist.

4.. Run `npm install` to the project that depends on janux-persist. 

**Simple example of creating a dao.**

1.. Create a typescript class that contains the attributes.

    class Car{
        //Needs to be public attributes. 
        //Private attributes with getters and setters does not work
        public name:string;
        public model:number;
    }


2.. Create a dao class.

    export class CarDao extends AbstractDataAccessObjectWithAdapter<Car,string> {
    
        constructor(dbAdapter: DbAdapter, entityProperties: EntityPropertiesImpl) {
            super(dbAdapter, entityProperties);
        }
        
        //Here you can define validations for the entity.
        //For example validate the name is not null or undeifned.
        protected validateEntity<t>(objectToValidate: Car): ValidationErrorImpl[] {
                const errors: ValidationErrorImpl[] = [];
                if(objectToValidate.name == null){
                    errors.push(
                        new ValidationErrorImpl(
                            "name",
                            "There is another car with the same name",
                            resultQuery.name));
                }
                return errors;
        }

        //Here you can define collection validations before insert the document.
        //For this example, lets asume we don't want more than one car with the same name.        
        protected validateBeforeUpdate<t>(objectToUpdate: Car): Promise<ValidationErrorImpl[]> {
        
            //You can reuse the same dao methods inside the dao.
            return this.findOneByAttribute("name", objectToInsert.name)
                .then((resultQuery: Car) => {
                    const errors: ValidationErrorImpl[] = [];
                    if (!_.isNull(result)) {
                        errors.push(
                            new ValidationErrorImpl(
                                "name",
                                "There is another car with the same name",
                                resultQuery.name));
                    }
                    return Promise.resolve(errors);
                });
        }
        
        //Here you can define collection validations before update the document.
        //For this example, lets asume we don't want more than one car with the same name.
        protected validateBeforeUpdate<t>(objectUpdate: Car): Promise<ValidationErrorImpl[]> {
        
            return this.findOneByAttribute("name", objectUpdate.name)
                .then((resultQuery: Car) => {
                    const errors: ValidationErrorImpl[] = [];
                    if (!_.isNull(result) && objectUpdate.id!=resultQuery.id) {
                        errors.push(
                            new ValidationErrorImpl(
                                "name",
                                "There is another car in the collection with the same name",
                                result.name));
                    }
                    return Promise.resolve(errors);
                });
        }
    }

AbstractDataAccessObjectWithAdapter has several methods for crud operations and simple queries. But
it does not contain any direct db operation.

For that all db operations are defined in a IGenericDaoCRUD 
instance called dbAdapter.

The project for the moment has two IGenericDaoCRUD instances. One for mongodb (MongooseAdapter) an the other for lokijs (LokiJsAdapter).  

3.. Create the implementations.
    
    //Lokijs implementation
    //1.-We need a lokis database.
    const lokiDatabase = new lokijs("myDatabase.db");
    //2.-We need to encapusalte the loki database inside a LokiJsAdapter instance.
    //LokiJsAdapter contains all lokijs db methods needed for the dao.
    const lokijsRepository = new LokiJsAdapter('carCollection', lokiDatabase);
    //3.-Create the dao
    var carDaoLokiJs = new CarDao(
        lokijsRepository,
        new EntityProperties(true,true)
    ); 
    
    //Mongo db
    //1.- We need a mongoose model. For that we need to define a
    //mongoose connection and use a mongoose schema.
    mongoose.connect('mongodb://localhost/aMongoDatrabase');
    var model = mongoose.model('carCollection', CarMongooseSchema);
    //2.- We need to encapsulate the mongoose model in a MongooseAdapter.
    //MongooseAdapter contains all mongodb methods needed for the dao.
    var mongoRepository = new MongooseAdapter(model);
    //3.- Create the dao.
    var carDaoMongoDb = new CarDao(
        mongoRepository,
        new EntityProperties(true,true)); 

    //You can use the implementations.
    const car:Car = new Car();
    car.name = "volvo";
    car.model = 2012;
    
    carDaoMongoDb.insert(car);
    carDaoLokiJs.insert(car);

**Using janux-persist inside another node project.**

Make sure the version of bluebird and @types/bluebird of janux-persist are the same in you project. Otherwise the typescript compiler will crash..
