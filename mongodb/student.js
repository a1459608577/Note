//use test // 存在则切换 不存在则创建    
//db.createCollection("student") // 创建集合
//db.dropDatabase() 删除数据库
//db.student.drop() // 删除集合
// show collections // 显示集合
//show dbs // 显示数据库
// 往集合中插入一条数据
//db.student.insert({name: 'zhangsan', age: 20, sex: '男'}) 
//db.student.insertOne({name: 'wangwu', age: 18, sex: '女', height: 165}) 
// 往集合中批量插入数据
//db.student.insertMany([
//{name: 'zhaoliu', age: 22, sex: '男', height: 185},
//{name: 'zengqi', age: 18, sex: '男', height: 175}]) 
// 查找操作
//db.student.find({"_id": ObjectId("62fa1b447812b0ba32a4013f"), "age": 20})
// 更新操作，multi表示是否修改所有符合条件的值 默认为false只修改第一条. false表示第一个参数为false，true
//db.student.update({age: 20}, {$set: {height: 185}}, {multi: true})
//db.student.update({name: 'lisi'}, {$set: {height: 164}}, false, true)
// 删除操作
//db.student.remove({name: 'zengqi'})
// 等于 小于 小于等于 大于 大于等于 不等于
//db.student.find({name: 'lisi'})
//db.student.find({age: {$lt: 20}}) 
//db.student.find({age: {$lte: 20}}) 
//db.student.find({age: {$gt: 20}}) 
//db.student.find({age: {$gte: 20}}) 
//db.student.find({age: {$ne: 20}}) 
// pretty是格式化显示
//db.student.find({}).pretty() 
// and 条件 和 or 条件
//db.student.find({age: {$ne: 20}, name: 'lisi'}) //and条件
//db.student.find({$or: [{age: {$lte: 18}}, {name: 'lisi'}]}) // or条件
//db.student.find({sex: '女', $or: [{age: {$lte: 18}}, {name: 'lisi'}]}) // and 跟or 结合
// 分页查询使用limit,limit表示查询前多少条数据,skip表示跳过前多少条数据，合起来就是跳过前两条数据取两条
//db.student.find().limit(2).skip(2)
// 根据年龄排序 1表示从小到大 -1表示从大到小
//db.student.find().sort({age: 1})
// 查询name字段中类型为string的数据，2表示string，其他的可根据菜鸟教程查看
//db.student.find({name: {$type: 2}})
// 使用正则表达式匹配 查询比较慢
//db.student.find({name: /s/})
// 统计集合中有多少条数据
//db.student.count()

// 创建索引
//db.student.createIndex({name: 1})
// 创建聚合索引
//db.student.createIndex({name: 1, age: -1})
// 设置索引失效时间
//db.student.createIndex({name: 1}, {expireAfterSeconds: 5})
// 删除索引
//db.student.dropIndex("name_1_age_-1")
// 查看索引大小
//db.student.totalIndexSize()

//db.student.insert({name: 'zengqi', age: 18, sex: '男', height: 175, birthday: new Date('2022-08-16 14:45:30')})
//db.student.remove({name: 'zengqi'})

// 查询索引 result: [ { "v" : 2, "key" : { "_id" : 1 }, "name" : "_id_" } ] v表示版本号，key表示索引字段1表示升序，name表示索引字段的名字
//db.advertise.getIndexes()
//db.advertise.createIndex({id: 1})
//db.advertise.find({id: '1552807381933625344'}).explain()

//db.student.find()

//use test
// 创建角色
//db.createUser({
//　　user: 'admin', // 用户名
//　　pwd: '123456', // 密码
//　　roles:[{
//　　role: 'root', // 角色
//　　db: 'admin' // 数据库
//　　}]
//})

db.advertise.find({channel_name: 'ChannelName', create_time: {$gt: new Date('2022-08-16 12:00:00')}})

