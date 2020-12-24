'use strict';

const axios = require('axios');

const fetchAllNotes = async (magazineId) => {
  const url = `https://note.com/api/v1/layout/magazine/${magazineId}/section`;
  const result = await axios.get(url + "?page=1");
  const totalCount = result.data.data.section.total_count;
  const pageNum = Math.floor((totalCount / 10) + 1);

  let arr = [];
  for (let page = 1; page < pageNum; page++) {
    const resultPerPage = await axios.get(url + `?page=${page}`);
    arr.push(resultPerPage.data.data.section.contents);
  }

  return arr.flat();
};

const orderByCount = (users) => {
  return users.sort((a, b) => { return b.count - a.count });
};

const getCountForEachUserInMagazine = async (magazineId) => {
  const contents = await fetchAllNotes(magazineId);
  let countForEachUser = [];

  // monthは0~11
  const dateFrom = new Date(2020, 11, 1);
  const dateTo = new Date(2020, 11, 28);

  for (let content of contents) {
    const urlname = content.user.urlname;
    const publishAt = new Date(content.publish_at);
    if (dateFrom <= publishAt && publishAt <= dateTo) {
      const user = countForEachUser.find((v) => v.name == urlname);
      if (user) {
        user.count += 1;
      } else {
        const newUser = {
          name: urlname,
          count: 1
        };
        countForEachUser.push(newUser);
      }
    }
  }

  console.log(orderByCount(countForEachUser));
};

// 標準入力からマガジンIDを受け取る
let lines = [];
let reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Enter magazineId then Press Cmd + D");

reader.on('line', function(line) {
  lines.push(line);
});
reader.on('close', function() {
  const magazineId = lines[0];
  getCountForEachUserInMagazine(magazineId);
  console.log("fetching...");
});