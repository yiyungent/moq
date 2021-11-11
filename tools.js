const fs = require("fs"),
  stat = fs.stat,
  path = require("path");

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
let copy = function (src, dst) {
  // 读取目录中的所有文件/目录
  fs.readdir(src, function (err, paths) {
    if (err) {
      throw err;
    }

    paths.forEach(function (path) {
      var _src = src + "/" + path,
        _dst = dst + "/" + path,
        readable,
        writable;

      stat(_src, function (err, st) {
        if (err) {
          throw err;
        }

        // 判断是否为文件
        if (st.isFile()) {
          // 创建读取流
          readable = fs.createReadStream(_src);
          // 创建写入流
          writable = fs.createWriteStream(_dst);
          // 通过管道来传输流
          readable.pipe(writable);
        }
        // 如果是目录则递归调用自身
        else if (st.isDirectory()) {
          exists(_src, _dst, copy);
        }
      });
    });
  });
};

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
let exists = function (src, dst, callback) {
  fs.exists(dst, function (exists) {
    // 已存在
    if (exists) {
      callback(src, dst);
    }
    // 不存在
    else {
      fs.mkdir(dst, function () {
        callback(src, dst);
      });
    }
  });
};

let deleteFile = function deleteFile(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFile(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

let mapDir = function mapDir(dir, callback, finish) {
  fs.readdir(dir, function (err, files) {
    if (err) {
      console.error(err);
      return;
    }
    // .md 文件数
    let fileNum = 0;
    files.forEach((filename, index) => {
      let pathname = path.join(dir, filename);
      fs.stat(pathname, (err, stats) => {
        // 读取文件信息
        if (err) {
          console.log("获取文件stats失败");
          return;
        }
        if (stats.isDirectory()) {
          // 递归文件夹
          mapDir(pathname, callback, finish)
        } else if (stats.isFile()) {
          if ([".md"].includes(path.extname(pathname))) {
            // 只要 .md 文件

            fs.readFile(pathname, (err, data) => {
              if (err) {
                console.error(err);
                return;
              }
              callback && callback(data, filename, pathname);
            });

            fileNum++;
            if (index === files.length - 1) {
              finish && finish(fileNum);
            }
          }
        }
      });
    });
  });
};

let getFileNameWithoutExt = function (filename) {
  let endIndex = filename.lastIndexOf(".");
  if (endIndex != -1) {
    return filename.substring(0, endIndex);
  }
  return filename;
};

let replaceAll = function (find, replace, str) {
  var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return str.replace(new RegExp(find, 'g'), replace);
}

// var fs = require("fs");  
// var path = require("path");  

// 递归创建目录 异步方法  
function mkdirs(dirname, callback) {  
  fs.exists(dirname, function (exists) {  
      if (exists) {  
          callback();  
      } else {  
          // console.log(path.dirname(dirname));  
          mkdirs(path.dirname(dirname), function () {  
              fs.mkdir(dirname, callback);  
              console.log('在' + path.dirname(dirname) + '目录创建好' + dirname  +'目录');
          });  
      }  
  });  
}  
// 递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

module.exports = { copy, exists, deleteFile, mapDir, getFileNameWithoutExt, replaceAll, mkdirsSync };
