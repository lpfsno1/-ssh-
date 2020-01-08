const $NobyDa = (() => {
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const setCache = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const getCache = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const GET = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, callback)
    }
    const POST = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.post(options, callback)
    }
    const end = () => {
        if (isQuanX) return ""
        if (isSurge) return $done()
    }
    return { isQuanX, isSurge, notify, setCache, getCache, GET, POST, end }
})();

const log = true;
const CookieJD = $NobyDa.getCache("CookieJD")
JingDongBean()

function JingDongBean() {
  const JDBUrl = {
    url: 'https://api.m.jd.com/client.action?functionId=lotteryDraw&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%2C%22lotteryCode%22%3A%224wwzdq7wkqx2usx4g5i2nu5ho4auto4qxylblkxacm7jqdsltsepmgpn3b2hgyd7hiawzpccizuck%22%7D&appid=ld',
    headers: {
      Cookie: CookieJD,
    }
  };

  $NobyDa.GET(JDBUrl, function(error, response, data) {
    if (error) {
      $NobyDa.notify("京东签到错误‼️‼️", "", error)
      const JDBean = "京东商城-转盘: 签到接口请求失败 ‼️‼️" + "\n"
    } else {
      const cc = JSON.parse(data)
      if (cc.code == 3) {
        if (log) console.log("Cookie error response: \n" + data)
        const JDBean = "京东商城-转盘: 签到失败, 原因: Cookie失效 ⚠️" + "\n"
        notice(JDBean)
      } else {
        if (data.match(/(\"T216\"|活动结束)/)) {
          const JDBean = "京东商城-转盘: 签到失败, 原因: 活动已结束 ⚠️" + "\n"
          notice(JDBean)
        } else {
          if (data.match(/京豆/)) {
            if (log) console.log("京东商城-转盘签到成功response: \n" + data)
              if (cc.data.prizeSendNumber) {
                const JDBean = "京东商城-转盘: 签到成功, 明细: " + cc.data.prizeSendNumber + "京豆 🐶" + "\n"
                notice(JDBean)
              } else {
                const JDBean = "京东商城-转盘: 签到成功, 明细: 显示接口待更新 ⚠️" + "\n"
                notice(JDBean)
              }
          } else {
            if (log) console.log("京东商城-转盘签到失败response: \n" + data)
            if (cc.data.chances == 1 && data.match(/未中奖/)) {
              JingDongBean()
            } else if (cc.data.chances == 0 && data.match(/未中奖/)) {
              const JDBean = "京东商城-转盘: 签到成功, 明细: 未中奖 🐶" + "\n"
              notice(JDBean)
            } else if (data.match(/(T215|次数为0)/)){
              const JDBean = "京东商城-转盘: 签到失败, 原因: 已签过 ⚠️" + "\n"
              notice(JDBean)
            } else {
              const JDBean = "京东商城-转盘: 签到失败, 原因: 未知 ⚠️" + "\n"
              notice(JDBean)
            }
          }
        }
      }
    }
  })
}

function notice(JDBean) {
  $NobyDa.notify(JDBean, "", "")
  $NobyDa.end()
}
