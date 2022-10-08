let express = require('express')
let User = require('./crud.js')
let md5 = require('blueimp-md5')
let Teacher = require('./teacher.js')
let Student = require('./student.js')
let router = express.Router()

// 增
router.post("/user/register", (req, res) => {
    let body = req.body

    User.find({ // 去数据库中查询这个数据， 如果有就不用创建了（？？？？但是如果两个中只有一个数据库中有，他是注册成功还是失败，应该设置一下用户名唯一）
        $or: [{
            username: body.username
        }, {
            nickname: body.nickname
        }]
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "查询失败"
            })
        }
        if (data.length !== 0) {
            return res.status(200).json({ //如果数据库中有，就是账户被注册过
                code: 2000,
                flag: false,
                message: "用户或昵称已存在"
            })
        }
        body.token = md5(md5(body.username) + "meimv") //对密码进行加密
        console.log(body);
        new User(body).save().then((data, err) => { //把数据存在数据库中
            if (data) {
                return res.status(200).json({
                    code: 2000,
                    flag: true,
                    message: "数据存储成功"
                })
            }
            if (err) {
                return res.status(500).json({
                    code: 3000,
                    flag: false,
                    message: "存储失败"
                })
            }
        })
    })
})

// 查
router.post("/user/login", (req, res) => { //去数据库中查找有没有登录的数据
    let body = req.body
    User.findOne({ username: body.username, password: body.password }, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "登录失败，请联系后台"
            })
        }
        if (!data) { //如果信息没查到
            return res.status(200).json({ //数据库中没有，就是用户或昵称不存在
                code: 2000,
                flag: false,
                message: "用户或昵称不存在"
            })
        }

        return res.json({
            "code": 2000,
            "flag": true,
            "message": "登录成功！",
            "data": {
                "token": data.token
            }
        })
    })
})

// 查----用户信息
router.get("/user/info", (req, res) => {
    let body = req.query // get请求拿数据，在地址栏中拿，在query里
    User.findOne({
        token: body.token
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "token查询失败，请联系后台"
            })
        }
        if (!data) { //如果信息没查到
            return res.status(200).json({ //数据库中没有，就是token不存在
                code: 2000,
                flag: false,
                message: "token不存在"
            })
        }

        return res.json({
            "code": 2000,
            "flag": true,
            "message": "登录拿到所有数据",
            "data": {
                "nickname": data.nickname,
                "id": data._id
            } //把数据返回出去
        })
    })
})

// 退出登录
router.post("/user/logout", (req, res) => {
    let body = req.body
        // console.log(body);
    User.findOne({ token: body.token }, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        if (!data) { //如果信息没查到
            return res.status(200).json({ //数据库中没有，就是token不存在
                code: 4000,
                flag: false,
                message: "token数据不存在"
            })
        }

        return res.status(200).json({
            code: 2000,
            flag: true,
            message: "退出成功 "
        })
    })

})

// 查询所有---获取教师列表
router.get("/teacher/list", (req, res) => {
    Teacher.find({
        // token: body.token
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        let content = data.length

        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "查询成功",
            "data": {
                content,
                "rows": data
            } //把数据返回出去
        })
    })
})


// 分页
router.post("/teacher/list", (req, res) => {
    let page = req.body.page || 1; //页数
    let size = req.body.size || 10; //一页显示多少条
    let searchMap = req.body.searchMap || {}
        // console.log(page, size, searchMap);
    let obj = {}
    searchMap.jobnumber ? obj["jobnumber"] = searchMap.jobnumber : obj
    searchMap.name ? obj["name"] = searchMap.name : obj
    searchMap.role ? obj["role"] = searchMap.role : obj
    searchMap.entrydate ? obj["entrydate"] = searchMap.entrydate : obj

    Teacher.find(obj, (err, data) => {
        if (err) {
            return res.status(500).json({
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        let content = data.length

        //skip跳过多少条,limit查询多少个,exec当前面的代码，执行完毕后，产生的回调
        Teacher.find(obj).skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    code: 3000,
                    flag: false,
                    message: "服务器后台错误"
                })
            }
            return res.status(200).json({
                "code": 2000,
                "flag": true,
                "message": "查询成功",
                "data": {
                    content,
                    "rows": data
                }
            })
        })
    })

})


// 教师存储
router.post("/teacher", (req, res) => {
    console.log(req.body);
    let obj = {
        jobnumber: req.body.jobnumber,
        name: req.body.name,
        role: req.body.role,
        entrydate: req.body.entrydate,
        phone: req.body.phone
    }
    new Teacher(obj).save(function(err) {

        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }


        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "新增成功！",
        })
    })

})


// 教师编辑
router.get("/teacher", (req, res) => {
    Teacher.findById(req.query.id, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "根据ID查找成功！",
            "data": data
        })
    })

})


// 教师编辑(更新操作)
router.put("/teacher", (req, res) => {
    let id = req.body._id //具体哪一条数据
    Teacher.findByIdAndUpdate(id, req.body, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "修改教师信息成功！",
        })
    })
})

// 教师删除
router.delete("/teacher", (req, res) => {
    // console.log(req.body);
    Teacher.findByIdAndRemove(req.body.id, (err) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "删除教师信息成功！",
        })
    })
})


// 学生列表
router.post("/student/list", (req, res) => {
    let page = req.body.page || 1; //页数
    let size = req.body.size || 10; //一页显示多少条
    let searchMap = req.body.searchMap || {}
        // console.log(page, size, searchMap);
    let obj = {}
    searchMap.stunum ? obj["stunum"] = searchMap.stunum : obj
    searchMap.name ? obj["name"] = searchMap.name : obj
    searchMap.teacher ? obj["teacher"] = searchMap.teacher : obj
        // searchMap.entrydate ? obj["entrydate"] = searchMap.entrydate : obj

    Student.find(obj, (err, data) => {
        if (err) {
            return res.status(500).json({
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        let content = data.length

        //skip跳过多少条,limit查询多少个,exec当前面的代码，执行完毕后，产生的回调
        Student.find(obj).skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    code: 3000,
                    flag: false,
                    message: "服务器后台错误"
                })
            }
            return res.status(200).json({
                "code": 2000,
                "flag": true,
                "message": "查询成功",
                "data": {
                    content,
                    "rows": data
                }
            })
        })
    })

})

// 新增学生
router.post("/student", function(req, res) {
    let obj = {
        name: req.body.name,
        stunum: req.body.stunum,
        admissiondate: req.body.admissiondate,
        phone: req.body.phone,
        teacher: req.body.teacher,
        class: req.body.class,
        job: req.body.job,
        money: req.body.money,
    }
    new Student(obj).save(function(err) {
        if (err) {
            return res.status(500).json({
                code: 3000,
                flag: false,
                message: "新增学生失败"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "新增学生成功"
        })
    })
});

// 学生编辑
router.get("/student", (req, res) => {
    Student.findById(req.query.id, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "根据ID查找成功！",
            "data": data
        })
    })

})

// 学生编辑(更新操作)
router.put("/student", (req, res) => {
    let id = req.body._id //具体哪一条数据
    Student.findByIdAndUpdate(id, req.body, (err, data) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "修改学生信息成功！",
        })
    })
})

// 学员删除
router.delete("/student", (req, res) => {
    // console.log(req.body);
    Student.findByIdAndRemove(req.body.id, (err) => {
        if (err) {
            return res.status(500).json({ //如果err，就是错误就是数据库中没有
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "删除学生信息成功！",
        })
    })
})

// 修改密码（原密码的查询）
router.post("/user/pwd", (req, res) => {
    // console.log(req.body)
    let data = req.body
        // console.log(data.id, data.msg.id);
    User.findOne({
        _id: data.id,
        password: data.pwd
    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }

        if (!data) {
            return res.status(200).json({
                "code": 4000,
                "flag": false,
                "message": "密码不正确"
            })
        }

        return res.status(200).json({
            "code": 2000,
            "flag": true,
            "message": "密码正确"
        })
    })
})

// 修改密码（更新密码）
router.put("/user/pwd", function(req, res) {
    let data = req.body
    User.findOne({
        _id: data.id,
        // password: data.pwd

    }, (err, data) => {
        if (err) {
            return res.status(500).json({
                code: 3000,
                flag: false,
                message: "服务器后台错误"
            })
        }
        if (!data) {
            return res.status(200).json({
                "code": 4000,
                "flag": false,
                "message": "密码错误"
            })
        }

        data.password = req.body.pwd //修改密码
        User.findByIdAndUpdate(req.body.id, data, (err) => {
            if (err) {
                return res.status(500).json({
                    code: 3000,
                    flag: false,
                    message: "服务器后台错误"
                })
            }
            return res.status(200).json({
                "code": 2000,
                "flag": true,
                "message": "修改密码成功"
            })
        })
    });
});
module.exports = router