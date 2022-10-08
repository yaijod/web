module.exports = {
    devServer: {
        port: 8001, //端口号
        host: "localhost", //主机名称
        https: false, //是否使用https协议
        open: true, //启动服务之后是否主动打开浏览器

    },
    productionSourceMap: false, //打包完成，不生成.map文件
    lintOnSave: false //关闭语法监测
}