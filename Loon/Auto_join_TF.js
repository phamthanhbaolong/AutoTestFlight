/*
Kịch bản bởi: DecoAri
Tác giả sửa : xream
Địa chỉ tham khảo: https://raw.githubusercontent.com/DecoAri/JavaScript/main/Surge/Auto_join_TF.js
Cảm ơn ai đó đã viết lại kịch bản thành phiên bản Loon!
*/
!(async () => {
  ids = $persistentStore.read("APP_ID");
  if (ids == null) {
    $notification.post(
      "TestFlight APP_ID chưa được thêm vào",
      "Thêm thủ công hoặc truy cập link tf app mình cần để hệ thống tự thêm",
      ""
    );
  } else if (ids == "") {
    $notification.post("Tất cả TestFlights đã được thêm vào", "Vui lòng vô hiệu hóa plugin theo cách thủ công", "");
  } else {
    ids = ids.split(",");
    for await (const ID of ids) {
      await autoPost(ID);
    }
  }
  $done();
})();

function sendMessageToTelegram(message) {
  return new Promise((resolve, reject) => {
    const chat_id = "7956935164";
    const telegrambot_token = "7956935164:AAHqd2vAavPLYKJqBk3IUMCjxjP61e0pu5M";
    const url = `https://api.telegram.org/bot${telegrambot_token}/sendMessage`;
    const body = {
      chat_id: chat_id,
      text: message,
      entities: [{ type: "pre", offset: 0, length: message.length }],
    };
    const options = {
      url: url,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };

    $httpClient
      .post(options)
      .then((response) => {
        if (response.statusCode == 200) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Telegram API request failed with status code ${response.statusCode}`
            )
          );
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function autoPost(ID) {
  let Key = $persistentStore.read("key");
  let testurl = "https://testflight.apple.com/v3/accounts/" + Key + "/ru/";
  let header = {
    "X-Session-Id": `${$persistentStore.read("session_id")}`,
    "X-Session-Digest": `${$persistentStore.read("session_digest")}`,
    "X-Request-Id": `${$persistentStore.read("request_id")}`,
    "User-Agent": `${$persistentStore.read("tf_ua")}`,
  };
  return new Promise(function (resolve) {
    $httpClient.get(
      { url: testurl + ID, headers: header },
      function (error, resp, data) {
        if (error == null) {
          if (resp.status == 404) {
            ids = $persistentStore.read("APP_ID").split(",");
            ids = ids.filter((ids) => ids !== ID);
            $persistentStore.write(ids.toString(), "APP_ID");
            console.log(ID + " " + "TestFlight không tồn tại và APP_ID đã tự động bị xóa.");
            $notification.post(
              ID,
              "TestFlight không tồn tại",
              "APP_ID đã được tự động xóa"
            );
            resolve();
          } else {
            let jsonData = JSON.parse(data);
            if (jsonData.data == null) {
              console.log(ID + " " + jsonData.messages[0].message);
              resolve();
            } else if (jsonData.data.status == "FULL") {
              console.log(
                jsonData.data.app.name + " " + ID + " " + jsonData.data.message
              );
              resolve();
            } else {
              $httpClient.post(
                { url: testurl + ID + "/accept", headers: header },
                function (error, resp, body) {
                  let jsonBody = JSON.parse(body);
                  $notification.post(
                    jsonBody.data.name,
                    "TestFlight Tham gia thành công",
                    ""
                  );
                  console.log(jsonBody.data.name + " TestFlight Tham gia thành công");
                  ids = $persistentStore.read("APP_ID").split(",");
                  ids = ids.filter((ids) => ids !== ID);
                  $persistentStore.write(ids.toString(), "APP_ID");
                  sendMessageToTelegram(
                    `${jsonBody.data.name} joined successfully`
                  );
                  resolve();
                }
              );
            }
          }
        } else {
          if (error == "The request timed out.") {
            resolve();
          } else {
            $notification.post("Tự động tham gia TestFlight", error, "");
            console.log(ID + " " + error);
            resolve();
          }
        }
      }
    );
  });
}
