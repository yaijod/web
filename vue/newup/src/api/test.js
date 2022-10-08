import request from "@/utils/request.js";
const BASE_URL = "http://localhost:8888"
    // request.get(BASE_URL + "/db.json").then(res => { console.log("测试结果", res.data) }).catch(err => {
    //     console.log("Err", err)
    // })
export default {
    getList() {
        let req = request({
            url: BASE_URL + "/db.json",
            method: "get"
        })
        return req
    }
}