# API和事件

+ [oicq.createClient(uin[,config])](#oicq.createClient(uin[,config]))
+ [oicq.setGlobalConfig(config)](#oicq.setGlobalConfig(config))
+ [Class: oicq.Client](#Class-Client)
  + [Events](#Events)
    + [Event: system](#Event-system)
    + [Event: message](#Event-message)
    + [Event: request](#Event-request)
    + [Event: notice](#Event-notice)
  + [client.login(password_md5)](#client.login(password_md5))
  + [client.captchaLogin(captcha)](#client.captchaLogin(captcha))
  + [client.terminate()](#client.terminate())
  + [APIs](#APIs)

----

## `oicq.createClient(uin[,config])`

+ `uin` \<number>
+ `config` \<Object>

创建一个实例：

```js
const oicq = require("oicq");
const uin = 123456789, config = {};
const client = oicq.createClient(uin, config);
```

config说明：

```js
//要使用默认配置请勿传递该字段
const config = {
    platform:       2,      //登陆类型 1手机 2平板 3手表(不支持部分群事件)
    log_level:      "info", //日志级别，有trace,debug,info,warn,error,fatal,off
    kickoff:        false,  //被挤下线是否在3秒后反挤对方
    ignore_self:    true,   //群聊是否无视自己的发言
};
```

※ 不建议在单个工作线程中运行多个实例。如果确实有需要，建议使用 [Worker threads](https://nodejs.org/dist/latest/docs/api/worker_threads.html) 或 [Child process](https://nodejs.org/dist/latest/docs/api/child_process.html) 管理实例。

----

## oicq.setGlobalConfig(config)

+ `config` \<Object>

全局设置

```js
//要使用默认配置请勿传递该字段
oicq.setGlobalConfig({
    web_image_timeout:  0,  //下载网络图片的超时时间(0表示系统自己判断)
    web_record_timeout: 0,  //下载网络语音的超时时间
    cache_root:         "", //缓存文件夹根目录，需要可写权限,默认主目录下的data文件夹
    debug: false,
});
```

----

## Class: `Client`

只能使用工厂方法 createClient 创建实例。

----

## Events

使用 `client.on()` 来监听一个事件：

```js
client.on("system.login", (data)=>{
    console.log(data);
});
```

事件为冒泡传递，例如 `request.group.add` 事件，若未监听会沿着 `request.group` 传递到 `request`  
事件使用cqhttp风格命名和参数，所有事件数据都为json对象，并包含以下共通字段：

+ `self_id`
+ `time`
+ `post_type` 一级分类 system, message, request, notice
+ `{post_type}_type` 二级分类如 system.login, request.group
+ `sub_type` 三级分类，有时会没有

----

## Event: `system`

+ `system.login`
  + `system.login.captcha` 收到验证码 `image` 字段为图像Buffer
  + `system.login.device` 需要解设备锁 `url` 字段为设备锁验证地址
  + `system.login.error` 其他原因如密码错误 `message` 字段为失败原因
+ `system.online` 上线事件，可以开始处理消息
+ `system.offline` 下线事件
  + `system.offline.network` 网络断开
  + `system.offline.frozen` 被冻结
  + `system.offline.kickoff` 另一处登陆
  + `system.offline.device` 由于开启设备锁，需要重新验证
  + `system.offline.unknown` 未知

----

以下事件与 [CQHTTP](https://github.com/howmanybots/onebot/blob/master/v11/specs/event/README.md) 大同小异

## Event: `message`

+ `message.private`
  + `message.private.friend` 好友消息
  + `message.private.single` 单向好友消息(对方未加你)
  + `message.private.group` 群临时会话
  + `message.private.other` 其他临时会话
+ `message.group`
  + `message.group.normal` 群消息
  + `message.group.anonymous` 群匿名消息

----

## Event: `request`

+ `request.friend`
  + `request.friend.add` 好友请求
+ `request.group`
  + `request.group.add` 加群请求
  + `request.group.invite` 加群邀请

----

## Event: `notice`

为了统一风格，notice事件的命名和原版cqhttp有一定出入

+ `notice.friend`
  + `notice.friend.increase` 好友增加
  + `notice.friend.decrease` 好友减少(被拉黑或自己删除)
  + `notice.friend.recall` 消息撤回事件
+ `notice.group`
  + `notice.group.increase` 群员增加
  + `notice.group.decrease` 群员减少
  + `notice.group.recall` 消息撤回事件
  + `notice.group.admin` 管理变更事件
  + `notice.group.ban` 群禁言事件
  + `notice.group.transfer` 群转让事件
  + `notice.group.notice` 收到群公告
  + `notice.group.file` 收到群文件
  + `notice.group.name` 群名变更事件
  + `notice.group.poke` 群戳一戳事件

----

## 系统类API

## `client.login(password_md5)` 密码登陆

+ `password_md5` \<string|Buffer> md5后的密码，可以是字符串或Buffer

----

## `client.captchaLogin(captcha)` 验证码登陆

+ `captcha` \<string> 4个字母

----

## `client.terminate()` 关闭连接

----

## APIs

(与 [CQHTTP](https://github.com/howmanybots/onebot/blob/master/v11/specs/api/public.md) 大同小异)

同步函数会直接返回。异步函数标注为 `async` ，返回的是 `Promise` ，返回值为以下格式的json对象：

```js
{
    retcode: 0,     //0成功 1状态未知 100参数错误 102失败 103超时
    status: "ok",   //ok或async或failed
    data: null,     //数据
    error: "",      //失败的时候偶尔会有这个字段
}
```

函数为驼峰命名，转换成下划线就是cqhttp的api，参数完全相同

----

### 获取好友、群、群员列表和info

+ async `client.getFriendList([no_cache])`
+ async `client.getGroupList([no_cache])`
+ async `client.getGroupMemberList(group_id[, no_cache])`
  + 获取列表返回的是ES6的Map类型，不是数组
+ async `client.getGroupInfo(group_id[, no_cache])`
+ async `client.getGroupMemberInfo(group_id, user_id[, no_cache])`
+ async `client.getStrangerInfo(user_id)`

----

### 发私聊消息、群消息

message可以使用 `Array` 格式或 `String` 格式，支持CQ码

+ async `client.sendPrivateMsg(user_id, message[, auto_escape])`
+ async `client.sendGroupMsg(group_id, user_id, message[, auto_escape])`
+ async `client.deleteMsg(message_id)`
  + `message_id` 现在是字符串，保存了所有撤回时需要用到的数据

----

### 处理申请和邀请

+ async `client.setFriendAddRequest(flag[, approve, remark, block])`
+ async `client.setGroupAddRequest(flag[, approve, reason, block])`
  + block字段表示是否拉黑，默认false

----

### 群操作(踢人、禁言、退群、设置等)

+ async `client.setGroupKick(group_id, user_id[, reject_add_request])`
+ async `client.setGroupBan(group_id, user_id[, duration])`
+ async `client.setGroupLeave(group_id)`

+ async `client.setGroupCard(group_id, user_id[, card])`
+ async `client.setGroupName(group_id, group_name)`
+ async `client.setGroupAdmin(group_id, user_id[, enable])`
+ async `client.setGroupSpecialTitle(group_id, user_id[, special_title, duration])`
+ async `client.sendGroupNotice(group_id, content)`
+ async `client.sendGroupPoke(group_id, user_id)` 戳一戳

----

## 改状态、加好友删好友、邀请好友入群

+ async `client.changeOnlineStatus(status)`
  + `status` 允许的值：11我在线上 31离开 41隐身 50忙碌 60Q我吧 70请勿打扰
+ async `client.addFriend(group_id, user_id[, comment])`
+ async `client.deleteFriend(user_id[, block])` block(屏蔽)默认是true
+ async `client.inviteFriend(group_id, user_id)`

----

## 其他

+ `client.canSendImage()`
+ `client.canSendRecord()`
+ `client.getStatus()`
+ `client.getVersionInfo()`
+ `client.getLoginInfo()`

----
