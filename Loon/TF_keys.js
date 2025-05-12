/*
Kịch bản bởi: DecoAri
Địa chỉ tham khảo: https://github.com/DecoAri/JavaScript/blob/main/Surge/TF_keys.js
Các bước sử dụng cụ thể
1: Nhập plugin
2: Đi đến trang Mitm để bật Mitm qua Http2
3: Khởi động VPN, vào ứng dụng TestFlight, tin nhắn thông báo sẽ hiển thị để báo hiệu quá trình thu thập dữ liệu thành công
4: Vào Configuration -> Persistent Data -> Import Specified Data, điền APP_ID làm khóa, điền ID của TF muốn join làm giá trị (ID là chuỗi sau khi join link https://testflight.apple.com/join/LPQmtkUs (tức là "LPQmtkUs" trong ví dụ này) ⚠️: Hỗ trợ liên kết TF không giới hạn, mỗi liên kết cần phân cách bằng dấu phẩy tiếng Anh "," (như: LPQmtkUs,Hgun65jg,8yhJgv)
)
*/
const reg1 = /^https:\/\/testflight\.apple\.com\/v3\/accounts\/(.*)\/apps$/;
const reg2 = /^https:\/\/testflight\.apple\.com\/join\/(.*)/;
if (reg1.test($request.url)) {
  $persistentStore.write(null, "request_id");
  let url = $request.url;
  let key = url.replace(/(.*accounts\/)(.*)(\/apps)/, "$2");
  let session_id =
    $request.headers["X-Session-Id"] || $request.headers["x-session-id"];
  let session_digest =
    $request.headers["X-Session-Digest"] ||
    $request.headers["x-session-digest"];
  let request_id =
    $request.headers["X-Request-Id"] || $request.headers["x-request-id"];
  let ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
  $persistentStore.write(key, "key");
  $persistentStore.write(session_id, "session_id");
  $persistentStore.write(session_digest, "session_digest");
  $persistentStore.write(request_id, "request_id");
  $persistentStore.write(ua, "tf_ua");
  console.log($request.headers);
  if ($persistentStore.read("request_id") !== null) {
    $notification.post("Thu thập thông tin TF", Thành công thu thập thông tin，Vui lòng tắt tập lệnh！", "");
  } else {
    $notification.post(
      "Thu thập thông tin TF",
      "Không lấy được thông tin. Vui lòng bật Mitm qua HTTP2 và khởi động lại VPN và ứng dụng TestFlight.！",
      ""
    );
  }
  $done({});
}
if (reg2.test($request.url)) {
  let appId = $persistentStore.read("APP_ID");
  if (!appId) {
    appId = "";
  }
  let arr = appId.split(",");
  const id = reg2.exec($request.url)[1];
  arr.push(id);
  arr = unique(arr).filter((a) => a);
  if (arr.length > 0) {
    appId = arr.join(",");
  }
  $persistentStore.write(appId, "APP_ID");
  $notification.post(
    "Tự động tham gia TestFlight",
    `Đã thêm APP_ID: ${id}`,
    `Hiện tại ID: ${appId}`
  );
  $done({});
}
function unique(arr) {
  return Array.from(new Set(arr));
}
