#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const yaml = require("js-yaml");
const tools = require("./tools");

program
  .command("hexop <noteRoot> <blogRoot>")
  .description(
    "将 Hexo笔记中 标记为public的文章(source/_posts) 复制到 Hexo Blog 中，以供发布"
  )
  .action((noteRoot, blogRoot) => {
    // 1. 先清空 <blogRoot>/source/_posts, 注意：_posts 文件夹也会被删除
    tools.deleteFile(`${blogRoot}/source/_posts`);
    console.log(`清空 '${blogRoot}/source/_posts' 成功`);
    fs.mkdirSync(`${blogRoot}/source/_posts`);
    // 提取 markdown 中的 front-matter
    let re = /---(.*?)---/s;
    const defaultPublic = true;
    let publicNum = 0;
    let totalNum = 0;
    tools.mapDir(
      noteRoot + "/source/_posts",
      function (data, filename, pathname) {
        let s = re.exec(data)[1];
        let doc = yaml.load(s);
        if (doc.public == undefined) {
          doc.public = defaultPublic;
        }
        if (doc.public) {
          publicNum++;
          // 2. 复制公开文章文件及对应媒体文件夹 到 <blogRoot>/source/_posts
          let temp = `${blogRoot}/source/_posts/${filename}`;
          fs.copyFileSync(pathname, temp);
          const src = tools.getFileNameWithoutExt(pathname);
          const dst = tools.getFileNameWithoutExt(temp);
          if(fs.existsSync(src)) {
            tools.exists(
              src,
              dst,
              tools.copy
            );
          }
          
          console.log(`${publicNum}: ${tools.getFileNameWithoutExt(filename)}`);
          if(publicNum == totalNum) {
            console.log(`复制完毕: ${publicNum}/${totalNum} 公开/总共`);
          }
        }
      },
      function (fileNum) {
        totalNum = fileNum;
      }
    );
    
  });

// 解析来自process.argv上的数据，commander会自动帮助我们添加一个 -h 的解析
program.parse(process.argv);
