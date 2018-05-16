# Vue-typescript-rtc v0.0.5
![](http://court.ptnetwork001.com/dist/images/tu-s.png)
> 公司湖里法院项目，主要功能在线多方视频，语音识别，证据上传同步投屏

## 功能
1. 七牛WebRTC 实现web端多方在线视频，只需登入网页，无须安装任何插件实现多方在线视频
2. 阿里语音识别API  实现庭审现场，法官、当事人视频语音流，调用阿里语音识别接口，形成庭审记录，节省庭审期间书记员的工作量
3. Reconnecting WebSocket 断线重连机制，为语音流传递、证据同步投屏保驾护航

## 特点
1. 使用vue，组件化编程，本地视频LocalPlayer、订阅视频RemotePlayer、主屏MainPlayer、识别记录ChatWindow、证据窗口EvidenceWindow
2. Vue、TypeScript、less编程
3. Vuex状态管理
4. 智能语音截断机制，判断声音强弱进行断句处理

## 主要第三方JS
1. pili-rtc-web
2. sweetalert2
3. vue-property-decorator
4. vuex-class

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# lint the Typescript
npm run lint

# run the tests
npm test

# run the tests on changes
npm run test:watch

# run the test suite and generate a coverage report
npm run coverage

# run the tests on Teamcity
npm run ci:teamcity

# run the tests on Jenkins
npm run ci:jenkins

# build for production with minification
npm run build

# clean the production build
npm run clean
```
