const Schema  = require('./schema')
require('dotenv').config()

/**
 * Run Parse server
 */
const https = require('https');
const config = require('./config');
const fs = require('fs');
const express = require('express');
const parseServer = require('./parseServer');
const app = express()
var ParseServer = https.createServer({
    key: fs.readFileSync(config.credentials.key),
    cert: fs.readFileSync(config.credentials.cert),
    passphrase: null
}, app);
var parse = new parseServer(ParseServer);
parse.run(app);
ParseServer.listen(config.port.parse);


var email = "gostudio-v4@gostream.vn"
var password = "g05tud1o(*&^%!@#$"
var fullname = "Administrator";


class InstallSchema {
    constructor(){
    }


    async defineSchema(){
        console.log('***** Parse schema installing.... *****')
        await Promise.all(Object.keys(Schema).map(async className => {
            /** 
             * Create Schema instance 
             * */
            let Instance = new Parse.Schema(className)
            /** 
             * Set CLP 
             * */
            let clp = Schema[className].classLevelPermissions
            Instance.setCLP(clp)
            /** 
             * Get Schema 
             * */
            let currentInstance = {}
            try {
                currentInstance = await Instance.get();
            } catch (error) {
                if(error.message === `Class ${className} does not exist.`){
                    currentInstance = await Instance.save(null,{useMasterKey: true })
                }
            }
            /** 
             * Get fields config 
             * */
            let flds = Schema[className].fields
            if(!flds) {
                /** 
                 * Create Schema without custom fields 
                 * */
                await Instance.save(null,{useMasterKey: true })
                console.log(`Created [${className}] ${ 'successfully without custom fields'}`)
                return 
            }
            /** 
             * Add custom fields into Schema 
             * */
            Object.keys(flds).map(key => {
                if(currentInstance.fields[key]) return // fields alrealy exists
                if(typeof flds[key] === 'string') Instance[`add${flds[key]}`](key) // String, Number, ..
                if(typeof flds[key] === 'object') Instance[`add${flds[key].type}`](key, flds[key].ref) // Pointer, Relation,...
            })
            /** 
             * Set indexes 
             * */
            let indexes = Schema[className].indexes
            Object.keys(indexes).map(field => {
                if(!flds[field] || (currentInstance.indexes && currentInstance.indexes[field])) return // Fields not exists
                Instance.addIndex(field, { [field]: indexes[field]})
            })
            /** 
             * Save 
             * */
            try {
                /** 
                 * Create new if not exists 
                 * */
               await Instance.save(null,{useMasterKey: true })
               console.log(`Created ${className} ${ 'successfully'}`)
            } catch (err) {
                if(err.message === `Class ${className} already exists.` || err.message === `Class _${className} already exists.`){
                    try {
                        /** 
                         * Update new fields if Schema already exists 
                         * */
                        await Instance.update(null,{useMasterKey: true })
                        console.log(`Updated [${className}] successfully`)
                    } catch (error) {
                        /** 
                         * Error 
                         * */
                        console.log(className, error);
                        console.log(`Updated [${className}] unsuccessfully`)
                    }
                }else{
                    /** 
                     * Error 
                     * */
                    console.log(`Created [${className}] unsuccessfully`)
                }
            }
            return true
        }))
        console.log('****** All schema updated! *****');
        
    }
    async initRole(name){
        /** 
         * Create role name:  Administrator
         * */
        console.log('Creating ['+name+'] role.....')
        const roleACL = new Parse.ACL();
        roleACL.setPublicReadAccess(true);
        const role = new Parse.Role(name, roleACL);
        try {
            await role.save(null,{useMasterKey: true});
        } catch (error) {
            if(error.message === 'A duplicate value for a field with unique values was provided'){
                console.log('Role ['+name+'] already exists')
                return true
            }else{
                console.log('Create Role ['+name+'] error ',error.message);
                return true
            }
        }
       
    }

    async initAdminAccount(){
        /** 
         * Create admin account 
         * */

        console.log("Creating admin's account.....")
        try {
            let user = await Parse.Cloud.run('user:signup',{
                email,password,fullname
            })
            if(user.id) {
                console.log("Admin's account created")
                let roleQuery = new Parse.Query(Parse.Role)
                roleQuery.equalTo('name','Administrator')
                let role =  await roleQuery.first({useMasterKey: true})
                role.getUsers().add(user);
                let saveRoleUser = await role.save(null,{useMasterKey: true})
                console.log("Update admin's account into role successfully!!")
            }
            if(user.status == 401){
                console.log("Admin's account already exists")
                let u = await new Parse.Query('User').equalTo('email',email).first({useMasterKey: true})
                let roleQuery = new Parse.Query(Parse.Role)
                roleQuery.equalTo('name','Administrator')
                let role =  await roleQuery.first({useMasterKey: true})
                role.getUsers().add(u);
                let saveRoleUser = await role.save(null,{useMasterKey: true})
                console.log("Update admin's account into role successfully!!")
            } 
            return user.id || false
        } catch (error) {
            console.log('error',error);
            console.log("Create admin's account unsuccessfully")
        }
       
    }

    async initServerAccount(){
        /** 
         * Create admin account 
         * */

         console.log("Creating server's account.....")
         try {
             let e = process.env.PARSE_USER
             let p = process.env.PARSE_PASS
             let user = await Parse.Cloud.run('user:signup',{
                 email: e,password : p,fullname :'Server'
             })
             if(user.id) {
                 console.log("Server's account created")
                 let roleQuery = new Parse.Query(Parse.Role)
                 roleQuery.equalTo('name','Server')
                 let role =  await roleQuery.first({useMasterKey: true})
                 role.getUsers().add(user);
                 let saveRoleUser = await role.save(null,{useMasterKey: true})
                 console.log("Update server's account into role successfully!!")
            }
             if(user.status == 401){
                 console.log("Server's account already exists")
                 let u = await new Parse.Query('User').equalTo('email',e).first({useMasterKey: true})
                 let roleQuery = new Parse.Query(Parse.Role)
                 roleQuery.equalTo('name','Server')
                 let role =  await roleQuery.first({useMasterKey: true})
                 role.getUsers().add(u);
                 let saveRoleUser = await role.save(null,{useMasterKey: true})
                 console.log("Update server's account into role successfully!!")
             } 
             return user.id || false
         } catch (error) {
             console.log('error',error);
             console.log("Create server's account unsuccessfully")
         }
    }

    async initPlan(){
        console.log('Creating default plan...')
        let Plan = Parse.Object.extend('Plan')
        let datas = [{
                "name": "free",
                "third_party": 0,
                "max_live": 1,
                "max_duration": 0.75,
                "max_dest": 1,
                "max_parallel": 1,
                "max_resolution": 0,
                "account": 1,
                "private_server": 0,
                "record_file": 1,
                "ecommerce": 0,
                "conference": 2,
                "price": 0
            },
            {
                "name": "silver",
                "third_party": 0,
                "max_live": 10,
                "max_duration": 2,
                "max_dest": 2,
                "max_parallel": 1,
                "max_resolution": 1,
                "account": 3,
                "private_server": 0,
                "record_file": 1,
                "ecommerce": 0,
                "conference": 2,
                "price": 199000
            },
            {
                "name": "gold",
                "third_party": 0,
                "max_live": 10,
                "max_duration": 4,
                "max_dest": 4,
                "max_parallel": 1,
                "max_resolution": 1,
                "account": 3,
                "private_server": 0,
                "record_file": 1,
                "ecommerce": 1,
                "conference": 2,
                "price": 299000
            },
            {
                "name": "diamond",
                "third_party": 1,
                "max_live": 30,
                "max_duration": 8,
                "max_dest": 10,
                "max_parallel": 1,
                "max_resolution": 2,
                "account": 3,
                "private_server": 0,
                "record_file": 4,
                "ecommerce": 1,
                "conference": 4,
                "price": 899000,
            }
        ]
        return await Promise.all(datas.map(async data => {
            let planQuery = new Parse.Query('Plan')
            planQuery.equalTo('name',data.name)
            let planObj  = await planQuery.first({useMasterKey: true })
            if(planObj && planObj.id)  console.log(`Plan [${data.name}] already exists.` )
            else{
                let plan = new Plan()
                let p = await plan.save(data, { useMasterKey: true })
                if(p.id) console.log(`Create plan [${data.name}] successfully` )
                else console.log(`Create plan [${data.name}] unsuccessfully` )
            }
        }))
    }

    async initMailConfig(){
        console.log('Creating default MailConfig...')
        let Config = Parse.Object.extend('MailConfig')
        let datas = [{
                "keyword": "user-register-success",
                "campaignId": "",
                "descrip": "Email gửi khách đăng ký thành công",
                "status": 2
            },
            {
                "keyword": "user-deposit-success",
                "campaignId": "",
                "descrip": "Email gửi khách có biến động số dư",
                "status": 2
            },
            {
                "keyword": "user-by-plan-success",
                "campaignId": "",
                "descrip": "Email gửi khách mua gói cước thành công",
                "status": 2
            },
            {
                "keyword": "user-register-aff-success",
                "campaignId": "",
                "descrip": "Email gửi khách có đăng ký mới từ link giới thiệu",
                "status": 2
            },
            {
                "keyword": "user-register-event-new",
                "campaignId": "",
                "descrip": "Email gửi khách chương trình đăng ký mới",
                "status": 2
            },
            {
                "keyword": "user-plan-extend",
                "campaignId": "",
                "descrip": "Email gửi khách gói cước hết hạn",
                "status": 2
            },
            {
                "keyword": "user-register-five-day",
                "campaignId": "",
                "descrip": "Email gửi khách đăng ký sau 5 ngày chưa nạp tiền",
                "status": 2
            },
            {
                "keyword": "user-register-not-live",
                "campaignId": "",
                "descrip": "Email gửi khách đăng ký sau 7 ngày chưa live gửi lặp lại trong 1 tháng",
                "status": 2
            },
            {
                "keyword": "user-register-live-regularly-not-transaction",
                "campaignId": "",
                "descrip": "Email gửi khách đăng ký live thường xuyên nhưng chưa mua gửi lặp lại trong 1 tháng",
                "status": 2
            },
            {
                "keyword": "user-register-live-no-often-not-transaction",
                "campaignId": "",
                "descrip": "Email gửi khách đăng ký live không thường xuyên chưa mua gửi lặp lại trong 1 tháng",
                "status": 2
            },
            {
                "keyword": "transaction-excess-money",
                "campaignId": "",
                "descrip": "Email gửi khách chuyển thừa tiền",
                "status": 2
            },
            {
                "keyword": "transaction-lack-of-money",
                "campaignId": "",
                "descrip": "Email gửi khách chuyển thiếu tiền",
                "status": 2
            }
        ]
        return await Promise.all(datas.map(async data => {
            let MailConfig = new Parse.Query('MailConfig')
            MailConfig.equalTo('keyword',data.keyword)
            let configObj  = await MailConfig.first({useMasterKey: true })
            if(configObj && configObj.id)  console.log(`MailConfig [${data.keyword}] already exists.` )
            else{
                let obj = new Config();
                obj.set("keyword", data.keyword);
                obj.set("descrip", data.descrip);
                obj.set("campaignId", data.campaignId);
                obj.set("status", data.status);
                let p = await obj.save(null, { useMasterKey: true });
                if(p.id) console.log(`Create MailConfig [${data.keyword}] successfully` )
                else console.log(`Create MailConfig [${data.keyword}] unsuccessfully` )
            }
        }))
    }

    async run(){
        await this.initRole('Administrator')
        await this.initRole('Server')
        await this.defineSchema()
        await this.initPlan()
        await this.initAdminAccount()
        await this.initServerAccount()
        await this.initMailConfig()
        console.log('*** Done! ***')
        process.exit()
    }
 
}

try {
    let installObj = new InstallSchema()
    installObj.run()
} catch (error) {
    console.log('error ',error.message);
}

