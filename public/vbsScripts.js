const fs = require("fs")
const path = require("path")
var copyVBSFile = (fileName) => {
    let buffer = fs.readFileSync(path.join(process.cwd(), '/vbs/' + fileName))
    return buffer.toString('base64')
}

result = {}
result["1.wsf"] = copyVBSFile("1.wsf")
result["ArchitectureAgnosticRegistry.vbs"] = copyVBSFile("ArchitectureAgnosticRegistry.vbs")
result["ArchitectureSpecificRegistry.vbs"] = copyVBSFile("ArchitectureSpecificRegistry.vbs")
result["JsonSafeTest.wsf"] = copyVBSFile("JsonSafeTest.wsf")
result["regCreateKey.wsf"] = copyVBSFile("regCreateKey.wsf")
result["regDeleteKey.wsf"] = copyVBSFile("regDeleteKey.wsf")
result["regDeleteValue.wsf"] = copyVBSFile("regDeleteValue.wsf")
result["regList.wsf"] = copyVBSFile("regList.wsf")
result["regListStream.wsf"] = copyVBSFile("regListStream.wsf")
result["regPutValue.wsf"] = copyVBSFile("regPutValue.wsf")
result["regUtil.vbs"] = copyVBSFile("regUtil.vbs")
result["util.vbs"] = copyVBSFile("util.vbs")
result["wsRegReadList.wsf"] = copyVBSFile("wsRegReadList.wsf")
result["wsRegReadListStream.wsf"] = copyVBSFile("wsRegReadListStream.wsf")

console.log(Buffer.from(JSON.stringify(JSON.stringify(result)), 'utf8').toString('base64'))