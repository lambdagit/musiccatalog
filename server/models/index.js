"use strict";
const Sequelize = require('sequelize');
const bcrypt = require("bcrypt");
const md5 = require('MD5');
const fs = require('fs');
const util = require('util');

const fsExists = util.promisify(fs.exists);
const fsMkdir = util.promisify(fs.mkdir);
const fsRename = util.promisify(fs.rename);

// User model
const UserStruct = {
    id:         {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name:       {type: Sequelize.STRING},
    email:      {type: Sequelize.STRING, unique: true},
    password:   {type: Sequelize.STRING, allowNull: false}, 
}

class UserModel extends Sequelize.Model {
    static async generateHash(password) {
        return await bcrypt.hash(password, await bcrypt.genSalt(8));
    }
    
    async validPassword(password) {
        return await bcrypt.compare(password, this.password);
    }
    
    static async addUser(name, email, password) {
        try 
        {
            const user = await UserModel.create({
                                    name:name, 
                                    email:email, 
                                    password:await UserModel.generateHash(password) });
            return {user, err:null};
        }
        catch(e)
        {
            return {user:null, err:e};
        }
    }
}
// Catalog model
const CatalogStruct = {
    id:         {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title:      {type: Sequelize.STRING, allowNull: false},
}

class CatalogModel extends Sequelize.Model {
    static async getAll (limit, offset) {
        offset = offset || 0;
        limit = limit || 1000;
        return await CatalogModel.findAll({limit, offset, raw: true});
    }
}
// Track model
const TrackStruct = {
    id:         {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title:      {type: Sequelize.STRING, allowNull: false},
    duration:   {type: Sequelize.INTEGER},
    file:       {type: Sequelize.STRING, allowNull: false},
    user:       {type: Sequelize.INTEGER, references: { model: UserModel, key: 'id'}},
    catalog:    {type: Sequelize.INTEGER, references: { model: CatalogModel, key: 'id'}},
}

class TrackModel extends Sequelize.Model {
    static async getForCatalog(catalogId, limit, offset, User) {
        limit = limit || 1000;
        offset = offset || 0;
        return await TrackModel.findAll({
            where:{catalog: catalogId},
            limit,
            offset,
            include:[
                 { model:UserModel, as:'userO', 
                   where:{},
                   attributes:['name'],
                   required:false
                 }
            ],
            raw:true
        })
    }
    //TODO: make as setter
    //TODO: check/convert media to strict format(mp3)
    static async moveFile (file) {
        let pref = __dirname+'/../music/';
        const tok = md5(file.filename);
        pref = pref+tok.substr(0,3);
        if(! await fsExists(pref))
            await fsMkdir(pref);
        const dest = `${pref}/${tok}.${file.originalname.split('.').pop()}`;
        await fsRename(file.path, dest);
        console.log(dest);
        return dest;
    }
    
    static async addTrack(title, duration, file, user, catalog) {
        try
        {
            const filePath = await TrackModel.moveFile(file);
            console.log(file);
            const track = await TrackModel.create({title, duration, file:filePath, user, catalog});
            return {track,err:null};
        }
        catch(e)
        {
            console.log(e);
            return {track:null,err:e};
        }
    }
}

class Model {
    constructor(config) {
        const sequelize = new Sequelize(`postgres://${config.user}:${config.pass}@${config.host}:${config.port}/${config.dbname}`);
        this.models = new Object(null);
        UserModel.init(UserStruct, {
          sequelize,
          modelName: 'users'
        });
        
        CatalogModel.init(CatalogStruct, {
          sequelize,
          modelName: 'catalogs'
        });
        
        TrackModel.init(TrackStruct, {
          sequelize,
          modelName: 'tracks'
        });
        
        TrackModel.belongsTo(UserModel, {as:'userO', foreignKey: 'user'});
        
        this.models['user'] = UserModel;
        this.models['catalog'] = CatalogModel;
        this.models['track'] = TrackModel;
    }
    
    getModel(modelName) {
        if(this.models[modelName])
        {
            return this.models[modelName];
        }
        else throw new Error(`Unknown model ${modelName}`);
    }
}

module.exports = Model